const mongoose = require('mongoose');
const validator = require('validator');


const model = mongoose.model('User', {
  name: {
    type: String,
    required: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  birth: {
    type: Date,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  ip: {
    type: String,
    required: true,
    validate: {
      validator(ip) {
        return validator.isIP(ip);
      },
    },
  },
});

module.exports = model;
