import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extract text from PDF file
 */
export const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return cleanText(data.text);
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file');
  }
};

/**
 * Extract text from DOCX file
 */
export const extractTextFromDOCX = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return cleanText(result.value);
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX file');
  }
};

/**
 * Extract text from file based on extension
 */
export const extractTextFromFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  
  switch (ext) {
    case '.pdf':
      return await extractTextFromPDF(filePath);
    case '.docx':
    case '.doc':
      return await extractTextFromDOCX(filePath);
    default:
      throw new Error(`Unsupported file format: ${ext}`);
  }
};

/**
 * Clean and normalize extracted text
 */
const cleanText = (text) => {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s@.+-]/g, ' ')
    .trim()
    .toLowerCase();
};

export default { extractTextFromPDF, extractTextFromDOCX, extractTextFromFile };
