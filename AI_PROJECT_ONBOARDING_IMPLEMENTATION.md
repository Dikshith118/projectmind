# 🚀 AI-Powered Project Onboarding System

## Overview

Upgrade from simple text input to intelligent document-aware project planning.

---

## 📁 Folder Structure

```
server/
├── uploads/                    # Temporary file storage
├── middleware/
│   └── upload.js              # Multer configuration
├── services/
│   ├── fileParser.js          # Document parsing
│   ├── contextBuilder.js      # AI context preparation
│   └── intelligentPlanner.js  # Enhanced AI planning
├── controllers/
│   └── projectController.js   # Updated with file handling
└── routes/
    └── projects.js            # Updated routes

client/src/
├── components/
│   └── FileUpload.jsx         # New upload component
└── pages/
    └── Projects.jsx           # Enhanced form
```

---

## 🎯 Features

1. ✅ Document upload (PDF, DOCX, TXT, PPTX)
2. ✅ Intelligent text extraction
3. ✅ Context preprocessing
4. ✅ Enhanced AI planning
5. ✅ Tech stack detection
6. ✅ Architecture-aware tasks
7. ✅ Drag & drop UI
8. ✅ File preview
9. ✅ Upload progress
10. ✅ AI insights display

---

## 📦 Required NPM Packages

```bash
cd server
npm install multer pdf-parse mammoth officeparser
```

---

## Implementation Details

See individual files for complete code.
