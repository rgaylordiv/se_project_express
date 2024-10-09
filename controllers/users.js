const User = require('../models/user');
const { documentNotFoundError, castError, serverError, authenticationError, duplicationError } = require('../utils/errors');
const { JWT_SECRET } = require('../utils/config');
const bcrypt = require('bcryptjs');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch((err) => {
      console.error(err);
      return res.status(serverError).send({ message: "An error has occurred on the server"});
    }
  )};

const getCurrentUser = (req, res) => {
  const { userId } = req.user._id; //req.params

  User.findById(userId)
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch(err => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(documentNotFoundError).send({ message: err.message })
      }

      if (err.name === "CastError"){
        return res.status(castError).send({ message: "Invalid data" })
      }

      return res.status(serverError).send({ message: "An error has occurred on the server"});
    })
}

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  bcrypt.hash(password, 10) //second param is for length / req.body.password
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
          return res.status(duplicationError).send({ message: "User with this email doesn't exist"});
        }

        if (err.name === "ValidationError") {
          return res.status(castError).send({ message: "Invalid data" })
        }

        return res.status(serverError).send({ message: "An error has occurred on the server"});
    }))

  // User.create({ name, avatar })
  //   .then((user) => res.status(201).send(user))
  //   .catch((err) => {
  //     console.error(err);

  //     if (err.name === "ValidationError") {
  //       return res.status(castError).send({ message: "Invalid data" })
  //     }

  //     return res.status(serverError).send({ message: "An error has occurred on the server"});
  //   })
};

const updateUser = (req, res) => {
  const { name, avatar } = req.body;
  const { userId } = req.user._id; //req.params

  return User.findByIdAndUpdate(
    userId,
    { name, avatar },
    { runValidators: true, new: true}
    )
    .then((user) => {
      res.status(201).send(user);
    })
    .catch((err) => {
      console.error(err);

      if (err.name === "ValidationError") {
        return res.status(castError).send({ message: "Invalid data" })
      }

      if(err.name =="NotFound"){
        return res.status(404).send({ message: 'User could not be found'});
      }

      return res.status(serverError).send({ message: "An error has occurred on the server"});
    })
}

const login = (req, res) => {
  const { email, password } = req.body;

  if(!email || !password){
    return res.status(castError).send({ message: "Enter email and password"});
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(200).send({ token });
    })
    .catch(() => {
      res.status(authenticationError).send({ message: 'Authentication error'});
    })
}

module.exports = { getUsers, createUser, getCurrentUser, login, updateUser };