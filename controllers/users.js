const User = require('../models/user');
const { documentNotFoundError, castError, serverError } = require('../utils/errors');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch((err) => {
      console.error(err);
      return res.status(serverError).send({ message: err.message});
    }
  )};

const getUserById = (req, res) => {
  const { userId } = req.params;

  User.findById(userId)
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch(err => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(documentNotFoundError).send({ message: err.message })
      }

      if (err.name === "CastError"){
        return res.status(castError).send({ message: err.message })
      }

      return res.status(serverError).send({ message: err.message});
    })
}

const createUser = (req, res) => {
  const { name, avatar } = req.body;

  User.create({ name, avatar })
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      console.error(err);

      if (err.name === "ValidationError") {
        return res.status(castError).send({ message: err.message })
      }

      return res.status(serverError).send({ message: err.message});
    })
};

module.exports = { getUsers, createUser, getUserById };