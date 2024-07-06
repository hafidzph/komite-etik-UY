/* eslint-disable import/no-extraneous-dependencies */
const multer = require('multer');
const archiver = require('archiver');
const { Storage } = require('@google-cloud/storage');
const AdmZip = require('adm-zip');

const path = require('path');
const catchAsync = require('../utils/catchAsync');
const Document = require('../models/document.model');
const AppError = require('../utils/appError');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');

const serviceKeyPath = path.resolve(__dirname, '../service.json');

const storageBucket = new Storage({
  keyFilename: serviceKeyPath,
});

const bucket = storageBucket.bucket('komite_etik');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserDocuments = upload.array('documents', 8);

exports.uploadDocuments = catchAsync(async (req, res, next) => {
  const { researchName } = req.body;
  const { name, _id } = req.user;
  const admin = await User.findOne({ role: 'admin' });

  const timestamp = Date.now();
  const formattedResearchName = researchName.replace(/\s+/g, '_');
  const formattedName = name.replace(/\s+/g, '_');
  const zipFileName = `${formattedResearchName}-${formattedName}-${timestamp}.zip`;

  const archive = archiver('zip', {
    zlib: { level: 9 },
  });

  const buffers = [];
  archive.on('data', (data) => buffers.push(data));

  req.files.forEach((file) => {
    archive.append(file.buffer, { name: file.originalname });
  });

  archive.finalize();

  archive.on('end', async () => {
    const buffer = Buffer.concat(buffers);

    const blob = bucket.file(zipFileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on('error', (err) => {
      throw new AppError(err.message, 500);
    });

    blobStream.on('finish', async () => {
      await blob.makePublic();

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${zipFileName}`;

      await Notification.create({
        name: 'Berkas Penelitian Terkirim',
        description: `Unggahan Anda untuk penelitian '${researchName}' berhasil diterima. Mohon untuk menunggu berkas untuk diproses lebih lanjut.`,
        user: _id,
      });

      await Notification.create({
        name: 'Berkas Penelitian Baru Diterima',
        description: `Unggahan baru untuk penelitian '${researchName}' dari ${name} memerlukan perhatian Anda. Silakan periksa dan lakukan tindakan yang diperlukan.`,
        user: admin._id,
      });

      const newDocument = await Document.create({
        nameUser: name,
        researchName: researchName,
        status: 'Sedang Diproses',
        documents: publicUrl,
        createdBy: _id,
      });

      res.status(201).json({
        status: 'success',
        message: 'Documents uploaded, zipped, and made public successfully',
        data: newDocument,
      });
    });

    blobStream.end(buffer);
  });

  archive.on('error', (err) => {
    throw new AppError(err.message, 500);
  });
});

exports.updateDocuments = catchAsync(async (req, res, next) => {
  const { documentId } = req.params;

  const document = await Document.findById(documentId);

  if (!document) {
    return next(new AppError('No document found with that ID', 404));
  }

  const status = 'Sedang Diproses';
  document.reviewers = [];

  const oldZipName = document.documents.split('/').pop();
  const oldZipFile = bucket.file(oldZipName);

  const [zipExists] = await oldZipFile.exists();
  if (!zipExists) {
    return next(
      new AppError('Zip file not found in Google Cloud Storage', 404),
    );
  }

  const zipFileName = `Updated-${oldZipName}`;
  const newZipFile = bucket.file(zipFileName);

  const archive = archiver('zip', {
    zlib: { level: 9 },
  });

  const buffers = [];
  archive.on('data', (data) => buffers.push(data));

  req.files.forEach((file) => {
    archive.append(file.buffer, { name: file.originalname });
  });

  archive.finalize();

  archive.on('end', async () => {
    const buffer = Buffer.concat(buffers);

    const blobStream = newZipFile.createWriteStream({
      resumable: false,
    });

    blobStream.on('error', (err) => {
      throw new AppError(err.message, 500);
    });

    blobStream.on('finish', async () => {
      await newZipFile.makePublic();

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${zipFileName}`;

      document.status = status;
      document.documents = publicUrl;
      await document.save();

      await oldZipFile.delete();

      res.status(200).json({
        status: 'success',
        message: 'Documents updated and zipped successfully',
        data: document,
      });
    });

    blobStream.end(buffer);
  });

  archive.on('error', (err) => {
    throw new AppError(`Error occurred while zipping files: ${err}`, 500);
  });
});

exports.updateFormSurat = catchAsync(async (req, res, next) => {
  const { documentId } = req.params;

  const document = await Document.findById(documentId);

  if (!document) {
    return next(new AppError('No document found with that ID', 404));
  }

  const oldZipName = document.documents.split('/').pop();
  const oldZipFile = bucket.file(oldZipName);

  const [zipExists] = await oldZipFile.exists();
  if (!zipExists) {
    return next(
      new AppError('Zip file not found in Google Cloud Storage', 404),
    );
  }

  const [existingZipBuffer] = await oldZipFile.download();

  const zip = new AdmZip(existingZipBuffer);
  const zipEntries = zip.getEntries();

  const archive = archiver('zip', {
    zlib: { level: 9 },
  });

  const buffers = [];
  archive.on('data', (data) => buffers.push(data));

  let formSuratFound = false;
  const newFormSuratName = `formSurat-${req.file.originalname}`;

  zipEntries.forEach((entry) => {
    if (!entry.entryName.startsWith('formSurat')) {
      archive.append(entry.getData(), { name: entry.entryName });
    } else {
      formSuratFound = true;
      archive.append(req.file.buffer, { name: newFormSuratName });
    }
  });

  if (!formSuratFound) {
    return next(new AppError('formSurat entry not found in the zip', 404));
  }

  archive.finalize();

  archive.on('end', async () => {
    const buffer = Buffer.concat(buffers);

    const newZipFileName = `Updated-${oldZipName}`;
    const newZipFile = bucket.file(newZipFileName);

    const blobStream = newZipFile.createWriteStream({
      resumable: false,
    });

    blobStream.on('error', (err) => next(new AppError(err.message, 500)));

    blobStream.on('finish', async () => {
      await newZipFile.makePublic();

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${newZipFileName}`;

      document.status = 'Layak';
      document.documents = publicUrl;
      await document.save();

      await oldZipFile.delete();

      res.status(200).json({
        status: 'success',
        message: 'formSurat updated successfully',
        data: document,
      });
    });

    blobStream.end(buffer);
  });

  archive.on('error', (err) =>
    next(new AppError(`Error occurred while updating formSurat: ${err}`, 500)),
  );
});

exports.addReviewers = catchAsync(async (req, res, next) => {
  const { reviewers } = req.body;
  const { documentId } = req.params;

  const document = await Document.findById(documentId);

  if (!document) {
    return next(new AppError('No document found with that ID', 404));
  }

  const findReviewers = await Promise.all(
    reviewers.map(async (reviewerName) => {
      const reviewer = await User.findOne({
        name: reviewerName,
        role: 'reviewer',
      });

      if (!reviewer) {
        return next(
          new AppError(`Reviewer with name ${reviewerName} not found`, 404),
        );
      }

      await Notification.create({
        name: 'Berkas Penelitian untuk Direview',
        description: `Anda telah ditugaskan untuk mereview dokumen penelitian '${document.researchName}'. Segera cek di Berkas!`,
        user: reviewer._id,
      });

      return { _id: reviewer._id, name: reviewerName };
    }),
  );

  const newDocument = await Document.findByIdAndUpdate(
    documentId,
    {
      $addToSet: {
        reviewers: {
          $each: findReviewers,
        },
      },
      $set: {
        status: 'Sedang Direview',
      },
    },
    { new: true },
  );

  res.status(201).json({
    status: 'success',
    message: 'Reviewers added successfully',
    data: newDocument,
  });
});

exports.updateReviewerStatus = catchAsync(async (req, res, next) => {
  const { status, message } = req.body;
  const { documentId } = req.params;
  const { _id } = req.user;
  const admin = await User.findOne({ role: 'admin' });

  if (!admin) {
    return next(new AppError('Admin user not found', 404));
  }

  const newDocument = await Document.findOneAndUpdate(
    {
      _id: documentId,
      'reviewers._id': _id,
    },
    {
      $set: {
        'reviewers.$.status': status,
        'reviewers.$.message': message,
      },
    },
    { new: true },
  );

  if (!newDocument) {
    return next(new AppError('Document or reviewer not found', 404));
  }

  const { researchName, nameUser } = newDocument;

  await Notification.create({
    name: 'Reviewer Memberikan Ulasan Baru',
    description: `Reviewer '${req.user.name}' telah memperbarui status untuk penelitian '${researchName}' dari ${nameUser}. Silakan periksa dan lakukan tindakan yang diperlukan.`,
    user: admin._id,
  });

  res.status(200).json({
    status: 'success',
    message: 'Reviewer status updated successfully',
    data: newDocument,
  });
});

exports.getDocuments = catchAsync(async (req, res, next) => {
  const filter = req.query.filter || 'terbaru';
  let sortOption;

  if (filter === 'terbaru') {
    sortOption = { createdAt: -1 };
  } else if (filter === 'terlama') {
    sortOption = { createdAt: 1 };
  }

  const documents = await Document.find().sort(sortOption);

  res.status(200).json({
    status: 'success',
    data: {
      documents,
    },
  });
});

exports.getDocument = catchAsync(async (req, res, next) => {
  const document = await Document.findById(req.params.documentId);

  if (!document) {
    return next(new AppError('Document not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { document },
  });
});

exports.getDocumentsByUser = catchAsync(async (req, res, next) => {
  const { _id } = req.user;
  const { filter } = req.query;

  let sortOption;

  if (filter === 'terbaru') {
    sortOption = { createdAt: -1 };
  } else if (filter === 'terlama') {
    sortOption = { createdAt: 1 };
  }

  const documents = await Document.find({ createdBy: _id }).sort(sortOption);

  res.status(200).json({
    status: 'success',
    data: {
      documents,
    },
  });
});

exports.sendStatus = catchAsync(async (req, res, next) => {
  const { documentId } = req.params;
  const { status } = req.body;
  const admin = await User.findOne({ role: 'admin' });

  const document = await Document.findByIdAndUpdate(
    documentId,
    { status },
    { new: true },
  );

  switch (status) {
    case 'Tidak Layak':
      await Notification.create({
        name: 'Dokumen Tidak Layak',
        description: `Dokumen penelitian '${document.researchName}' telah dinyatakan tidak layak. Silakan periksa dan perbaiki masalah yang ada.`,
        user: document.createdBy,
      });
      break;
    case 'Perbaikan':
      await Notification.create({
        name: 'Dokumen Butuh Perbaikan',
        description: `Dokumen penelitian '${document.researchName}' butuh perbaikan. Silakan periksa dan perbaiki masalah yang ada.`,
        user: document.createdBy,
      });
      break;
    case 'Sedang Ditandatangani':
      await Notification.create({
        name: 'Dokumen Sedang Ditandatangani',
        description: `Dokumen penelitian '${document.researchName}' sedang ditandatangani oleh Ketua. Silakan tunggu konfirmasi lebih lanjut.`,
        user: document.createdBy,
      });

      await Notification.create({
        name: 'Dokumen Menunggu untuk Ditandatangani',
        description: `Dokumen penelitian '${document.researchName}' menunggu untuk ditandatangani. Silakan proses lebih lanjut pada halaman berkas.`,
        user: admin._id,
      });
      break;

    default:
      return next(new AppError('Something went wrong', 500));
  }

  res.status(200).json({
    status: 'success',
    data: { document },
  });
});
