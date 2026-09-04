const express = require('express');
const {
  uploadAndAnalyze,
  processImport,
  getImportHistory,
  getImportById,
  deleteImportHistory
} = require('../controllers/importController');
const { requireAuth } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

const router = express.Router();

router.use(requireAuth);

router.post('/upload', upload.single('file'), uploadAndAnalyze);
router.post('/process', processImport);
router.get('/history', getImportHistory);
router.get('/:id', getImportById);
router.delete('/:id', deleteImportHistory);

module.exports = router;
