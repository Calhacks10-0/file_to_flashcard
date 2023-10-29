import React, { useState } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import Flashcard from "./Flashcard";
// Configure the worker source path
export const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [flash, setFlash] = useState([]);
  const [lengthh, setLengthh] = useState(0);
  const [summary, setSummary] = useState("");
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (selectedFile) {
      console.log(selectedFile);
      const formData = new FormData();
      formData.append("selectedFile", selectedFile);
      console.log(formData);
      axios
        .post("http://localhost:3001/pdf/extract-text", formData)
        .then((response) => {
          console.log("Extracted text from the PDF:", response.data.text);
          console.log("Flashcards generated: ", response.data.flashcards);
          setLengthh(response.data.lengtt); 
          setFlash(response.data.flashcards);
          setSummary(response.data.summary); 
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };

  return (
    <div style={{ flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center", // Center items horizontally
          justifyContent: "center", // Optional: To make sure the container fills the viewport height
        }}
      >
        <h1>Quizzical</h1>
        <br />
        <br />
        <h3>Upload a File (.pdf or .mp4)</h3>

        <input type="file" onChange={handleFileChange} />
        <br />
        <Button variant="primary" onClick={handleUpload}>
          Process File
        </Button>
      </div>
      <br></br>
      <br></br>
      <br></br>

      <div>
        <Flashcard flashcards={flash} len={lengthh} summary={summary} />
      </div>
    </div>
  );
};
