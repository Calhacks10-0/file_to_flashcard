import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import Flashcard from "./Flashcard";
import { FadeLoader } from "react-spinners";

export const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [flash, setFlash] = useState([]);
  const [lengthh, setLengthh] = useState(0);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (selectedFile) {
      setLoading(true);

      const formData = new FormData();
      formData.append("selectedFile", selectedFile);

      axios
        .post("http://localhost:3001/pdf/extract-text", formData)
        .then((response) => {
          setLoading(false);
          console.log("Extracted text from the PDF:", response.data.text);
          console.log("Flashcards generated: ", response.data.flashcards);
          setLengthh(response.data.lengtt);
          setFlash(response.data.flashcards);
          setSummary(response.data.summary);
        })
        .catch((error) => {
          setLoading(false);
          console.error("Error:", error);
        });
    }
  };

  const centerLoader = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "150px", // Adjust the height as needed
  };

  return (
    <div style={{ flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
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
      <br />
      <br />
      <br />

      <div style={{ textAlign: "center" }}>
        {loading ? (
          <div style={centerLoader}>
            <FadeLoader color={"#123abc"} loading={loading} size={50} />
          </div>
        ) : (
          <Flashcard flashcards={flash} len={lengthh} summary={summary} />
        )}
      </div>
    </div>
  );
};
