import express from "express";
import pdf from "pdf-parse";
import multer from "multer";
import axios from "axios";
import { exec } from "child_process";
import { readFile, writeFile } from "fs/promises";
import { readFileSync} from "fs";

const router = express.Router();

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  "/extract-text",
  upload.single("selectedFile"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      let text;
      console.log("abc");
      if (req.file.originalname.split(".").pop().toLowerCase() == "pdf")
      {
        const pdfFile = req.file;
        const data = await pdf(pdfFile.buffer); // Use "buffer" property to access the file data
        text = data.text;
        console.log("The length of the text is ", text.length);
      } else {
        await writeFile("vid.mp4", req.file.buffer);
        const path_to_output_text_file = "transcription.txt";
        let python_promise = new Promise((resolve, reject) => {
          exec(
            `python3 videoToText.py vid.mp4`,
            (error, stdout, stderr) => {

              if (error) {
                console.log("abc1");
                reject(error);
                return;
              }
              console.log(`stdout: ${stdout}`);
              let file_contents = readFileSync(path_to_output_text_file, { encoding: "utf-8" });
              console.log(file_contents);
              resolve(file_contents);
            }
          );
        });

        text = await python_promise;
        //console.log(text);
      }

      // Maximum token limit (e.g., 32000 for your model)
      const maxTokenLimit = 10000;

      // Split the long text into smaller chunks
      const textChunks = [];
      let currentChunk = "";

      for (let i = 0; i < text.length; i++) {
        currentChunk += text[i];

        // Check if adding the next character would exceed the token limit
        if (currentChunk.length >= maxTokenLimit) {
          textChunks.push(currentChunk);
          currentChunk = "";
        }
      }

      // Add the remaining chunk, if any
      if (currentChunk) {
        textChunks.push(currentChunk);
      }

      // Define your API request options
      const apiBaseUrl = "https://api.together.xyz/inference";
      const apiKey =
        "90554c4bc558bb4b5532eaabc526b1c9d26ec89102d463f985a0a2af46b4aa0c"; // Replace with your actual API key

      const requestOptions = {
        method: "POST",
        url: apiBaseUrl,
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      };

      // Loop through text chunks and make separate API requests
      for (let i = 0; i < textChunks.length; i++) {
        const textChunk = textChunks[i];
        
        const options = {
          ...requestOptions,
          data: {
            model: "togethercomputer/llama-2-70b-chat",
            prompt:
              "<s>[INST]<<SYS>>" +
              "Generate front and back flashcards to cover the entire material in the provided text. These flashcards will be used to study for extremely important final exams." +
              "The back of a flashcard should be a single statement with no option for multiple responses. Here is an example: It is written that: Canada is a country in the Northern Hemisphere" +
              "Your flash card should follow this type of format - Front: What hemisphere is Canada in? Back: Northern Hemisphere. Also one very important thing is to not have incomplete sentences in either front or back. If there are incomplete sentences for back just leave the back blank" +
              "<</SYS>>" +
              `${textChunk}` +
              "[/INST]",
            max_tokens: 512,
            temperature: 0.7,
            top_p: 0.7,
            top_k: 50,
            repetition_penalty: 1,
            stop: ["[INST]", "</s>"],
          },
        };
        


        const second_request = {
          ...requestOptions,
          data: {
            model: "togethercomputer/llama-2-70b-chat",
            prompt:
              "<s>[INST]<<SYS>>" +
              "Generate a detailed summary of the provided text and it should be thorough enough that someone can study for a test by reading the summary. Output should be less than 512 tokens and should be in complete sentences" +
              "Here is some example text: Cells are largely composed of compounds that contain carbon. The study of how carbon atoms interact with other atoms in molecular compounds forms the basis of the field of organic chemistry and plays a large role in understanding the basic functions of cells. Because carbon atoms can form stable bonds with four other atoms, they are uniquely suited for the construction of complex molecules. These complex molecules are typically made up of chains and rings that contain hydrogen, oxygen, and nitrogen atoms, as well as carbon atoms. These molecules may consist of anywhere from 10 to millions of atoms linked together in specific arrays. Most, but not all, of the carbon-containing molecules in cells are built up from members of one of four different families of small organic molecules: sugars, amino acids, nucleotides, and fatty acids. Each of these families contains a group of molecules that resemble one another in both structure and function. In addition to other important functions, these molecules are used to build large macromolecules. For example, the sugars can be linked to form polysaccharides such as starch and glycogen, the amino acids can be linked to form proteins, the nucleotides can be linked to form the DNA (deoxyribonucleic acid) and RNA (ribonucleic acid) of chromosomes, and the fatty acids can be linked to form the lipids of all cell membranes." +
              "The corresponding summary is: Carbon-containing compounds are fundamental in cells and organic chemistry. Carbon's ability to form stable bonds with other atoms enables the creation of complex molecules in cells. These molecules consist of chains and rings with carbon, hydrogen, oxygen, and nitrogen atoms, ranging in size from small to large. Most cell molecules fall into four categories: sugars, amino acids, nucleotides, and fatty acids. These families share structural and functional similarities and are crucial in building large macromolecules. Sugars create polysaccharides, amino acids make proteins, nucleotides form DNA and RNA, and fatty acids produce cell membrane lipids. This molecular diversity is vital for cell function and organic chemistry." +
              "<</SYS>>" +
              `${textChunk}` +
              "[/INST]",
            max_tokens: 512,
            temperature: 0.7,
            top_p: 0.7,
            top_k: 50,
            repetition_penalty: 1,
            stop: ["[INST]", "</s>"],
          },
        };

        let flashcards, summary, lengtt;
        
        await axios
          .request(options)
          .then(function (response) {
            flashcards = response.data.output.choices.map((item) => {
              const text = item.text;
              // Split the text into flashcards using '\nFront: ' as the separator
              const flashcardChunks = text.split("\nFront: ");

              // Remove the first filler text and discard empty flashcards (those without a back)
              const filteredFlashcards = flashcardChunks
                .slice(1) // Skip the first filler text
                .filter((flashcard) => flashcard.includes("Back: ")); // Only keep flashcards with a back

              // Split each flashcard into front and back
              const frontAndBack = filteredFlashcards.map((flashcard) => {
                const [front, back] = flashcard.split("\nBack: ");
                return { front, back };
              });

              return frontAndBack;
            });
            console.log(flashcards);
            lengtt = flashcards[0].length; 

          })
          .catch(function (error) {
            console.error(`Error for chunk ${i}:`, error);
          });
          

          await axios
          .request(second_request)
          .then(function (response) {
            summary = response.data.output.choices[0].text;
            res.json({ text, flashcards, lengtt, summary});
          })
          .catch(function (error) {
            console.error(`Error for chunk ${i} (Summary):`, error);
          });

      } 

    } catch (error) {
      console.error("Error extracting text:", error);
      res.status(500).json({ error: "Text extraction failed." });
    }
  }
);

export { router as pdfRouter };
