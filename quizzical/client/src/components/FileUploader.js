import React, { useState } from "react";
import axios from "axios";

// Configure the worker source path
export const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [text, setText] = useState("");

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
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };

  return (
    <div>
      <h1>Upload a File</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};
