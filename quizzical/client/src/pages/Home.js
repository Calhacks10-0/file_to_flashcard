import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Image, Card } from "react-bootstrap";
import { FileUpload } from "../components/FileUploader";
export const Home = () => {
  const [data, setData] = useState([]);
  const usid = localStorage.getItem("userID");


  return (
    usid && 
    <FileUpload/>
  );
};
