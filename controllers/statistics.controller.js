const Document = require('../models/document.model');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');

const getActiveUsersCount = async () => await User.countDocuments();

const getUploadedFilesCount = async () => {
  const documents = await Document.find();
  return documents.reduce((acc, doc) => acc + doc.documents.length, 0);
};

const getCompletedDocumentsCount = async () =>
  await Document.countDocuments({ status: 'Layak' });

exports.getStatistics = catchAsync(async (req, res, next) => {
  const activeUsersCount = await getActiveUsersCount();
  const uploadedFilesCount = await getUploadedFilesCount();
  const completedDocumentsCount = await getCompletedDocumentsCount();

  res.status(200).json({
    status: 'success',
    data: {
      activeUsersCount,
      uploadedFilesCount,
      completedDocumentsCount,
    },
  });
});
