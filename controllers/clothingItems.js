const ClothingItem = require('../models/clothingItem')
const { documentNotFoundError, castError, serverError, forbiddenError } = require('../utils/errors')

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
  console.log('Owner:', owner);

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
  const userId = req.user._id;

  ClothingItem.findById(itemId) // was findByIdAndDelete
    .orFail()
    .then((items) => {
      const ownerId = items.owner.toString();

      if(userId !== ownerId) {
        return res.status(forbiddenError).send({ message: "You don't have permission to delete this item"})
      }

      return ClothingItem.findByIdAndDelete(itemId).orFail();
    })
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
    .then((item) => res.status(200).send({item}))
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