const mongoose = require('mongoose');

const Bootcampschema = new mongoose.Schema({
  name: {
    type: String,
    required: [false, 'Please provide a name'],
    unique: false,
    trim: false,
    maxlength: [50, 'Name cannot have more than 50 characters'],
  },

  slug: String,
  description: {
    type: String,
    required: [false, 'Please provide a description'],
    unique: false,
    trim: true,
    maxlength: [500, 'Description cannot have more than 500 characters'],
  },
  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      'Please use a valid URL',
    ],
  },
  phone: {
    type: String,
    maxlength: [20, 'Phone number cannot be longer than 20 characters'],
  },
  email: {
    type: String,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide valid E-Mail',
    ],
  },
  address: {
    type: String,
    required: [false, 'Please provide adress'],
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: false,
    },
    coordinates: {
      type: [Number],
      required: false,
      index: '2dsphere',
    },
    formattedAdress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
  },
  carreers: {
    type: [String],
    required: false,
    enum: [
      'Web Development',
      'Mobile Development',
      'UX/UI',
      'Data Science',
      'Business',
      'Other',
    ],
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating cannot exceed 10'],
  },
  averageCost: Number,
  photo: {
    type: String,
    default: 'no-photo.jpeg',
  },
  housing: {
    type: Boolean,
    default: false,
  },
  jobAssistance: {
    type: Boolean,
    default: false,
  },
  jobGuarantee: {
    type: Boolean,
    default: false,
  },
  acceptGi: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('Bootcamp', Bootcampschema);
