const ClothingItem = require('../models/clothingItem')
// const { serverError } = require('../utils/errors');
const ServerError  = require('../utils/ServerError');
const BadRequestError  = require('../utils/BadRequestError');
const ForbiddenError  = require('../utils/ForbiddenError');
const NotFoundError  = require('../utils/NotFoundError');


const getItems = (req, res, next) => {
  ClothingItem.find({})
    .then(items => res.status(200).send(items))
    .catch(err => {
      console.error(err);
      throw new ServerError("An error has occurred on the server");
    });
}

const createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;
  console.log('Image URL:', imageUrl);
  console.log('Owner:', owner);

  ClothingItem.create({ name, weather, imageUrl, owner })
    .then(item => res.status(201).send({data:item})) // item
    .catch(err => {
      console.error(err);

      if (err.name === "ValidationError") { // ValdiationError
        next(new BadRequestError('Invalid data')) // .send({ message: 'Invalid data' })  400 - BRE was castError
      } else{
        next(err);
      }

      // return res.status(serverError).send({ message: "An error has occurred on the server" });
    })
}

const deleteItem = (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  ClothingItem.findById(itemId) // was findByIdAndDelete
    .then((items) => {
      if(!items) throw new NotFoundError('Item not found');

      const ownerId = items.owner.toString();
      if(userId !== ownerId) {
        throw new ForbiddenError("You don't have permission to delete this item") // .send({ message: "You don't have permission to delete this item"}) // FE forbiddenError
      }

      return ClothingItem.findByIdAndDelete(itemId);
    })
    .then((item) => {
      if(!item) throw new NotFoundError("Item not found after delete");
      res.status(200).send(item)}) // {}
    .catch((err) => {
      console.error(err);

      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError(err.message));
      } else if (err.name === "CastError") {
        next(new BadRequestError('Invalid data'));
      } else {
        next(err);
      }
      // return res.status(serverError).send({ message: "An error has occurred on the server" });
    })
}

const likeItem = (req, res, next) => {
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(itemId,  {$addToSet: { likes: req.user._id }}, { new: true })
    .orFail()
    .then((item) => res.status(200).send({item}))
    .catch((err) => {
      console.error(err);

      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError('Data not found')) // .send({ message: err.message }) // NFE documentNotFoundError
      }

      if (err.name === "CastError") { // ValdiationError
        next(new BadRequestError('Invalid data')) // .send({ message: 'Invalid data' })  400 - BRE was castError
      } else {
        next(err);
      }

      // return res.status(serverError).send({ message: "An error has occurred on the server" });
    })
}

const dislikeItem = (req, res, next) => {
  const { itemId } = req.params;

  ClothingItem.findByIdAndUpdate(itemId,  {$pull: { likes: req.user._id }}, { new: true })
    .orFail()
    .then((item) => res.status(200).send({item}))
    .catch((err) => {
      console.error(err);

      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError('Data not found')) // .send({ message: err.message }) // NFE documentNotFoundError
      }

      if (err.name === "CastError") { // ValdiationError
        next(new BadRequestError('Invalid data')) // .send({ message: 'Invalid data' })  400 - BRE was castError
      } else {
        next(err);
      }

      // return res.status(serverError).send({ message: "An error has occurred on the server" });
    })
}

module.exports = { getItems, createItem, likeItem, dislikeItem, deleteItem };