const ClothingItem = require('../models/clothingItem')
const { documentNotFoundError, castError, serverError } = require('../utils/errors')

const getItems = (req, res) => {
  ClothingItem.find({})
    .then(items => res.status(200).send(items))
    .catch(err => {
      console.error(err);
      return res.status(serverError).send({ message: err.message });
    });
}

const createItem = (req, res) => {
  const { name, weather, imageURL } = req.body;
  const userId = req.user._id;

  ClothingItem.create({ name, weather, imageURL, owner: userId })
    .then(item => res.status(201).send(item))
    .catch(err => {
      console.error(err);

      if (err.name === "ValidationError") {
        return res.status(castError).send({ message: err.message })
      }

      return res.status(serverError).send({ message: err.message });
    })
}

const updateItem = (req, res) => {
  const { itemId } = req.params;
  const { imageURL } = req.body;

  ClothingItem.findByIdAndUpdate(itemId, {$set: {imageURL}})
    .orFail()
    .then((item) => res.status(200).send({ data: item}))
    .catch((err) => {
      console.error(err);
      return res.status(serverError).send({ message: err.message });
    })
}

const deleteItem = (req, res) => {
  const { itemId } = req.params;

  ClothingItem.findByIdAndDelete(itemId)
    .orFail()
    .then((item) => res.status(204).send(item)) //{}
    .catch((err) => {
      console.error(err);

      if (err.name === "DocumentNotFoundError") {
        res.status(documentNotFoundError).send({ message: err.message })
      } else if (err.name === "CastError"){
        res.status(castError).send({ message: err.message })
      }

      return res.status(serverError).send({ message: err.message });
    })
}

const likeItem = (req, res) => {
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(itemId,  {$addToSet: { likes: req.user._id }}, { new: true })
    .orFail()
    .then((item) => res.status(200).send(item))
    .catch((err) => {
      console.error(err);

      if (err.name === "DocumentNotFoundError") {
        res.status(documentNotFoundError).send({ message: err.message })
      } else if (err.name === "CastError"){
        res.status(castError).send({ message: err.message })
      }

      return res.status(serverError).send({ message: err.message });
    })
}

const dislikeItem = (req, res) => {
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(itemId,  {$pull: { likes: req.user._id }}, { new: true })
    .orFail()
    .then((item) => res.status(200).send(item))
    .catch((err) => {
      console.error(err);

      if (err.name === "DocumentNotFoundError") {
        res.status(documentNotFoundError).send({ message: err.message })
      } else if (err.name === "CastError"){
        res.status(castError).send({ message: err.message })
      }

      return res.status(serverError).send({ message: err.message });
    })
}

module.exports = { getItems, createItem, updateItem, likeItem, dislikeItem, deleteItem };