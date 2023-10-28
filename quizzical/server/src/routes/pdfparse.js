import express from 'express';
import pdf from 'pdf-parse';
import multer from 'multer';

const router = express.Router();

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/extract-text', upload.single('selectedFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const pdfFile = req.file;
    const data = await pdf(pdfFile.buffer); // Use "buffer" property to access the file data
    const text = data.text;

    // Detect the language of the extracted text using langchain.

    res.json({ text });
  } catch (error) {
    console.error('Error extracting text:', error);
    res.status(500).json({ error: 'Text extraction failed.' });
  }
});

export { router as pdfRouter };
