const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'Description must be provided'],
  },
  createdAt: String,
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
