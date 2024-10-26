const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const User = require('../models/user');
const { documentNotFoundError, castError, serverError, authenticationError, duplicationError, BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError } = require('../utils/errors');
const JWT_SECRET = require('../utils/config');

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id; // req.params

  User.findById(userId)
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch(err => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError('Data not found')) //.send({ message: err.message }) // NFE documentNotFoundError
      }

      if (err.name === "CastError") { // ValdiationError
        next(new BadRequestError({ message: 'Invalid data' })) //.send({ message: 'Invalid data' })  400 - BRE was castError
      } else {
       next(err);
      }

      // return res.status(serverError).send({ message: "An error has occurred on the server"});
    })
}

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  if(!email || !password){
    next(new BadRequestError('Enter email and password are required')) // castError
  }

  return User.findOne({email})  // added return here for github action
  .then((user) => {
    if(user){
      next(new ConflictError("User with this email doesn't exist")) //.send({ message: "User with this email doesn't exist"}); // duplicationError
    }
    return bcrypt.hash(password, 10)
      .then(hash => User.create({
        name,
        avatar,
        email, // req.body.email
        password: hash
      })
      .then(() => res.status(201).send({ name, avatar, email })) // was previously user param
      .catch((err) => {
        console.error(err);

        if(err.code === 11000){
          next(new ConflictError("User with this email doesn't exist")) //.send({ message: "User with this email doesn't exist"}); // duplicationError
        }

        if (err.name === "CastError") { // ValdiationError
          next(new BadRequestError('Invalid data')) //.send({ message: 'Invalid data' })  400 - BRE was castError
        } else {
          next(err);
        }

        // return res.status(serverError).send({ message: "An error has occurred on the server"});
    }))
  })
  .catch((err) => { // this was added to the findOne prosime so it can catch possible errors
    console.error(err);

    if(err.code === 11000){
      next(new ConflictError("User with this email doesn't exist")) //.send({ message: "User with this email doesn't exist"}); // duplicationError
    }

    if (err.name === "CastError") { // ValdiationError
      next(new BadRequestError('Invalid data')) //.send({ message: 'Invalid data' })  400 - BRE was castError
    } else {
      next(err);
    }

    // return res.status(serverError).send({ message: "An error has occurred on the server"});
})
};

const updateUser = (req, res, next) => {
  const { name, avatar } = req.body;
  const userId = req.user._id; // req.params

  return User.findByIdAndUpdate(
    userId,
    { name, avatar },
    { new: true, runValidators: true}
    )
    .orFail()
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      console.error(err);

      if (err.name === "CastError") { // ValdiationError
        next(new BadRequestError('Invalid data')) //.send({ message: 'Invalid data' })  400 - BRE was castError
      }

      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError('Data not found')) //.send({ message: err.message }) // NFE documentNotFoundError
      } else {
        next(err);
      }

      // return res.status(serverError).send({ message: "An error has occurred on the server"});
    })
}

const login = (req, res, next) => {
  const { email, password } = req.body;

  if(!email || !password){
    next(new BadRequestError('Enter email and password')) // castError
  }
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(200).send({ token });
    })
    .catch((err) => {
      if ((err.message === "Incorrect email address") || (err.message ===  "Incorrect password")) {
        next(new UnauthorizedError('Authentication error')) //.send({ message: 'Authentication error'}); // authenticationError
     } else {
      next(err);
     }

    //  return res.status(serverError).send({ message: "An error has occurred on the server"});  // the if block was added
    })
}

module.exports = { createUser, getCurrentUser, login, updateUser };