const mongoose  = require('mongoose');
const bluebird  = require('bluebird');
const validator = require('validator');
const env       = require('dotenv').config()
const UserModel = require('./model/User.js');

mongoose.Promise = bluebird;
const mongoString = process.env.URLMONGODB; // MongoDB Url

const createErrorResponse = (statusCode, message) => ({
  statusCode: statusCode || 501,
  headers: {
    'Content-Type': 'text/plain',
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  },
  body: message || 'Incorrect id',
});

const successRes = (statusCode, body) =>
{
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
    },
    body: JSON.stringify(body)
  };
};


  module.exports.helloWorld = (event, context, callback) => {
      callback(null, successRes(200,{message:"Hello World!"}));
  };


module.exports.alluser = (event, context, callback) => {
  const db = mongoose.connect(mongoString).connection;

  db.once('open', () => {
    UserModel
      .find({})
      .then((user) => {

        callback(null, successRes(200,user) );

      })
      .catch((err) => {
        callback(null, createErrorResponse(err.statusCode, err.message));
      })
      .finally(() => {
        // Close db connection or node event loop won't exit , and lambda will timeout
        db.close();
      });
  });
};

module.exports.user = (event, context, callback) => {
  const db = mongoose.connect(mongoString).connection;
  const id = event.pathParameters.id;

  if (!validator.isAlphanumeric(id)) {
    callback(null, createErrorResponse(400, 'Incorrect id'));
    db.close();
    return;
  }

  db.once('open', () => {
    UserModel
      .find({ _id: event.pathParameters.id })
      .then((user) => {
        callback(null, successRes(200, user) );//{ statusCode: 200, body: JSON.stringify(user) });
      })
      .catch((err) => {
        callback(null, createErrorResponse(err.statusCode, err.message));
      })
      .finally(() => {
        // Close db connection or node event loop won't exit , and lambda will timeout
        db.close();
      });
  });
};


module.exports.createUser = (event, context, callback) => {
  let db = {};
  let data = {};
  let errs = {};
  let user = {};
  const mongooseId = '_id';

  db = mongoose.connect(mongoString).connection;

  data = JSON.parse(event.body);

  user = new UserModel({ name: data.name,
    firstname: data.firstname,
    birth: data.birth,
    city: data.city,
    ip: event.requestContext.identity.sourceIp });

  errs = user.validateSync();

  if (errs) {
    console.log(errs);
    callback(null, createErrorResponse(400, 'Incorrect user data'));
    db.close();
    return;
  }


  db.once('open', () => {
    user
      .save()
      .then(() => {
        callback(null, successRes(200,{ id: user[mongooseId] }) )// createSuccessResponse(200,JSON.stringify({ id: user[mongooseId] }))); // { statusCode: 200, body: JSON.stringify({ id: user[mongooseId] }) });
      })
      .catch((err) => {
        callback(null, createErrorResponse(err.statusCode, err.message));
      })
      .finally(() => {
        db.close();
      });
  });
};

module.exports.deleteUser = (event, context, callback) => {
  const db = mongoose.connect(mongoString).connection;
  const id = event.pathParameters.id;

  if (!validator.isAlphanumeric(id)) {
    callback(null, createErrorResponse(400, 'Incorrect id'));
    db.close();
    return;
  }

  db.once('open', () => {
    UserModel
      .remove({ _id: event.pathParameters.id })
      .then(() => {
        callback(null,  successRes(200,`User deleted: ${event.pathParameters.id}`)); // { statusCode: 200, body: JSON.stringify('Ok') });
      })
      .catch((err) => {
        callback(null, createErrorResponse(err.statusCode, err.message));
      })
      .finally(() => {
        db.close();
      });
  });
};

module.exports.updateUser = (event, context, callback) => {
  const db = mongoose.connect(mongoString).connection;
  const data = JSON.parse(event.body);
  const id = event.pathParameters.id;
  let errs = {};
  let user = {};

  if (!validator.isAlphanumeric(id)) {
    callback(null, createErrorResponse(400, 'Incorrect id'));
    db.close();
    return;
  }

  user = new UserModel({ _id: id,
    name: data.name,
    firstname: data.firstname,
    birth: data.birth,
    city: data.city,
    ip: event.requestContext.identity.sourceIp });

  errs = user.validateSync();

  if (errs) {
    callback(null, createErrorResponse(400, 'Incorrect parameter'));
    db.close();
    return;
  }

  db.once('open', () => {
    // UserModel.save() could be used too
    UserModel.findByIdAndUpdate(id, user)
      .then(() => {

        callback(null,  successRes(200,`User updated: ${event.pathParameters.id}`)); // { statusCode: 200, body: JSON.stringify('Ok') });
      })
      .catch((err) => {
        callback(err, createErrorResponse(err.statusCode, err.message));
      })
      .finally(() => {
        db.close();
      });
  });
};
