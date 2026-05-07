const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const officeParser = require('officeparser');

/**
 * Extract text content from uploaded document
 * @param {string} filePath - Path to the uploaded file
 * @param {string} mimetype - MIME type of the file
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextFromFile(filePath, mimetype) {
  try {
    const ext = path.extname(filePath).toLowerCase();

    // PDF files
    if (mimetype === 'application/pdf' || ext === '.pdf') {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    }

    // DOCX files
    if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }

    // TXT files
    if (mimetype === 'text/plain' || ext === '.txt') {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    }

    // PPTX files
    if (mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || ext === '.pptx') {
      return new Promise((resolve, reject) => {
        officeParser.parseOffice(filePath, (data, err) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
    }

    // DOC files (legacy)
    if (mimetype === 'application/msword' || ext === '.doc') {
      return new Promise((resolve, reject) => {
        officeParser.parseOffice(filePath, (data, err) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
    }

    throw new Error('Unsupported file type');
  } catch (error) {
    console.error('File parsing error:', error);
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
}

/**
 * Clean up uploaded file
 * @param {string} filePath - Path to the file to delete
 */
async function cleanupFile(filePath) {
  try {
    await fs.unlink(filePath);
    console.log('Cleaned up file:', filePath);
  } catch (error) {
    console.error('Failed to cleanup file:', error);
  }
}

module.exports = {
  extractTextFromFile,
  cleanupFile
};
