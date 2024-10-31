const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const User = require('../models/user');
const ConflictError  = require('../utils/ConflictError');
const BadRequestError  = require('../utils/BadRequestError');
const UnauthorizedError  = require('../utils/UnauthorizedError');
const NotFoundError  = require('../utils/NotFoundError');

const JWT_SECRET = require('../utils/config');

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .then((user) => {
      if(!user) throw new NotFoundError('User not found');
      res.status(200).send(user)
    })
    .catch(err => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError('Data not found'))
      }

      if (err.name === "CastError") {
        next(new BadRequestError({ message: 'Invalid data' }))
      } else {
       next(err);
      }
    })
}

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  if(!email || !password){
    return next(new BadRequestError('Email and password are required'))
  }

  return User.findOne({email})
  .then((user) => {
    if(user){
      throw new ConflictError("User with this email already exists");
    }
    return bcrypt.hash(password, 10)
      .then(hash => User.create({
        name,
        avatar,
        email,
        password: hash
      })
      .then(() => res.status(201).send({ name, avatar, email }))
      .catch((err) => {
        if (err.code === 11000) {
          next(new ConflictError("User with this email already exists"));
        } else if (err.name === "ValidationError") {
          next(new BadRequestError('Invalid data'));
        } else {
          next(err);
        }
      }))
  })
  .catch((err) => {
    next(err);
})
};

const updateUser = (req, res, next) => {
  const { name, avatar } = req.body;
  const userId = req.user._id;

  return User.findByIdAndUpdate(
    userId,
    { name, avatar },
    { new: true, runValidators: true}
    )
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      console.error(err);

      if (err.name === "CastError") {
        next(new BadRequestError('Invalid data'))
      }

      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError('Data not found'))
      } else {
        next(err);
      }
    })
}

const login = (req, res, next) => {
  const { email, password } = req.body;

  if(!email || !password){
    throw new BadRequestError('Enter email and password')
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
        next(new UnauthorizedError('Authentication error'))
     } else {
      next(err);
     }
    })
}

module.exports = { createUser, getCurrentUser, login, updateUser };