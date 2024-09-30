const ClothingItem = require('../models/clothingItem')
const { documentNotFoundError, castError, serverError } = require('../utils/errors')

const getItems = (req, res) => {
  ClothingItem.find({})
    .then(items => res.status(200).send(items))
    .catch(err => {
      console.error(err);
      return res.status(serverError).send({ message: "An error has occurred on the server" });
    });
}

const createItem = (req, res) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;
  console.log('Image URL:', imageUrl);

  ClothingItem.create({ name, weather, imageUrl, owner })
    .then(item => res.status(201).send({data:item})) // item
    .catch(err => {
      console.error(err);

      if (err.name === "ValidationError") {
        return res.status(castError).send({ message: 'Invalid data' })
      }

      return res.status(serverError).send({ message: "An error has occurred on the server" });
    })
}

const deleteItem = (req, res) => {
  const { itemId } = req.params;

  console.log(itemId)

  ClothingItem.findByIdAndDelete(itemId)
    .orFail()
    .then((item) => res.status(200).send(item)) // {}
    .catch((err) => {
      console.error(err);

      if (err.name === "DocumentNotFoundError") {
        return res.status(documentNotFoundError).send({ message: err.message })
      }

      if (err.name === "CastError"){
        return res.status(castError).send({ message: 'Invalid data' })
      }

      return res.status(serverError).send({ message: "An error has occurred on the server" });
    })
}

const likeItem = (req, res) => {
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(itemId,  {$addToSet: { likes: req.user._id }}, { new: true })
    .orFail()
    .then((item) => res.status(200).send({item}))
    .catch((err) => {
      console.error(err);

      if (err.name === "DocumentNotFoundError") {
        return res.status(documentNotFoundError).send({ message: err.message })
      }

      if (err.name === "CastError"){
        return res.status(castError).send({ message: "Invalid data" })
      }

      return res.status(serverError).send({ message: "An error has occurred on the server" });
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
        return res.status(documentNotFoundError).send({ message: err.message })
      }

      if (err.name === "CastError"){
        return res.status(castError).send({ message: 'Invalid data' })
      }

      return res.status(serverError).send({ message: "An error has occurred on the server" });
    })
}

module.exports = { getItems, createItem, likeItem, dislikeItem, deleteItem };