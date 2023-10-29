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
      if (JSON.stringify(req.file).split(".").pop().toLowerCase() == "pdf") {
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
              // if (stderr.trim().length > 0) {
              //   console.log(stderr);
              //   console.log("abc2");
              //   reject(stderr);
              //   return;
              // }
              console.log(`stdout: ${stdout}`);
              let file_contents = readFileSync(path_to_output_text_file, { encoding: "utf-8" });
              console.log(file_contents);
              resolve(file_contents);
            }
          );
        });

        text = await python_promise;
        console.log(text);
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

        axios
          .request(options)
          .then(function (response) {
            const flashcards = response.data.output.choices.map((item) => {
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
          })
          .catch(function (error) {
            console.error(`Error for chunk ${i}:`, error);
          });
      }
      const flashcards = "A";

      res.json({ text, flashcards });
    } catch (error) {
      console.error("Error extracting text:", error);
      res.status(500).json({ error: "Text extraction failed." });
    }
  }
);

export { router as pdfRouter };
