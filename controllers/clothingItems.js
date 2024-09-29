const ClothingItem = require('../models/clothingItem')
const { documentNotFoundError, castError, serverError } = require('../utils/errors')

const getItems = (req, res) => {
  ClothingItem.find({})
    .then(items => res.status(200).send(items))
    .catch(err => {
      console.error(err);
      return res.status(serverError).send({ message: "Couldn't get the items" });
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
        return res.status(castError).send({ message: 'cast error' })
      }

      return res.status(serverError).send({ message: "server error" });
    })
}

// const updateItem = (req, res) => {
//   const { itemId } = req.params;
//   const { imageUrl } = req.body;

//   ClothingItem.findByIdAndUpdate(itemId, {$set: {imageUrl}})
//     .orFail()
//     .then((item) => res.status(200).send({ data: item }))
//     .catch((err) => {
//       console.error(err);
//       return res.status(serverError).send({ message: err.message });
//     })
// }

const deleteItem = (req, res) => {
  const { itemId } = req.params;

  ClothingItem.findByIdAndDelete(itemId)
    .orFail()
    .then((item) => res.status(204).send(item)) // {}
    .catch((err) => {
      console.error(err);

      if (err.name === "DocumentNotFoundError") {
        res.status(documentNotFoundError).send({ message: 'Document error for deleting an item' })
      } else if (err.name === "CastError"){
        res.status(castError).send({ message: 'Cast error for deleting an item' })
      }

      return res.status(serverError).send({ message: err.message });
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
        return res.status(documentNotFoundError).send({ message: 'Document error for liking' })
      }

      if (err.name === "CastError"){
        return res.status(castError).send({ message: "Cast error for liking" })
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
        return res.status(documentNotFoundError).send({ message: 'Document for dislikes not available' })
      }

      if (err.name === "CastError"){
        return res.status(castError).send({ message: 'Cast error for dislikes' })
      }

      return res.status(serverError).send({ message: err.message });
    })
}

module.exports = { getItems, createItem, likeItem, dislikeItem, deleteItem };