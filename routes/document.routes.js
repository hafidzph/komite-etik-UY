const express = require('express');
const multer = require('multer');

const {
  uploadDocuments,
  uploadUserDocuments,
  addReviewers,
  updateReviewerStatus,
  getDocuments,
  getDocumentsByUser,
  sendStatus,
  getDocument,
  updateDocuments,
  updateFormSurat,
} = require('../controllers/document.controller');
const { authorize, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router
  .route('/')
  .post(authorize, uploadUserDocuments, uploadDocuments)
  .get(authorize, getDocuments);

router.get('/user', authorize, getDocumentsByUser);

router
  .route('/:documentId')
  .get(getDocument)
  .patch(authorize, uploadUserDocuments, updateDocuments);

router.patch(
  '/:documentId/reviewers',
  authorize,
  restrictTo('admin'),
  addReviewers,
);

router.patch(
  '/:documentId/status',
  authorize,
  restrictTo('reviewer'),
  updateReviewerStatus,
);

router.patch(
  '/:documentId/status/send',
  authorize,
  restrictTo('admin'),
  sendStatus,
);

router.patch(
  '/:documentId/formSurat',
  authorize,
  restrictTo('admin'),
  upload.single('formSurat'),
  updateFormSurat,
);

module.exports = router;
