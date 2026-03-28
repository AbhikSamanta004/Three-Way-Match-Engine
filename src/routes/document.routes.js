const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadDocument, getDocument, getMatchResult } = require('../controllers/document.controller');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() +path.extname(file.originalname));// file name with date to keep it unique
    }
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/:id', getDocument);

module.exports = router;

