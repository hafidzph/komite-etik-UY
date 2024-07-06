/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');

const {
  signUp,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth.controller');
const {
  getAllUsers,
  updatePhoto,
  uploadUserPhoto,
  resizeUserPhoto,
  getUser,
  updatePassword,
  updateName,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/user.controller');
const { authorize, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/signUp', signUp);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', login);
router.post('/resend-verify-email', resendVerificationEmail);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updatePassword', authorize, updatePassword);
router.patch('/updateName', authorize, updateName);
router.patch(
  '/updatePhoto',
  authorize,
  uploadUserPhoto,
  resizeUserPhoto,
  updatePhoto,
);

router.route('/').get(authorize, getAllUsers).post(createUser);

router.route('/user').get(authorize, getUser);

router
  .route('/:id')
  .get(authorize, getUserById)
  .patch(authorize, restrictTo('admin'), updateUser)
  .delete(authorize, restrictTo('admin'), deleteUser);

module.exports = router;
