const ClothingItem = require('../models/clothingItem')
const BadRequestError  = require('../utils/BadRequestError');
const ForbiddenError  = require('../utils/ForbiddenError');
const NotFoundError  = require('../utils/NotFoundError');


const getItems = (req, res, next) => {
  ClothingItem.find({})
    .then(items => res.status(200).send(items))
    .catch(next);
}

const createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;
  console.log('Image URL:', imageUrl);
  console.log('Owner:', owner);

  ClothingItem.create({ name, weather, imageUrl, owner })
    .then(item => res.status(201).send({data:item}))
    .catch(err => {
      console.error(err);

      if (err.name === "ValidationError") {
        next(new BadRequestError('Invalid data'))
      } else{
        next(err);
      }
    })
}

const deleteItem = (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  ClothingItem.findById(itemId)
    .then((items) => {
      if(!items) throw new NotFoundError('Item not found');

      const ownerId = items.owner.toString();
      if(userId !== ownerId) {
        throw new ForbiddenError("You don't have permission to delete this item")
      }

      return ClothingItem.findByIdAndDelete(itemId);
    })
    .then((item) => {
      if(!item) throw new NotFoundError("Item not found after delete");
      res.status(200).send(item)})
    .catch((err) => {
      console.error(err);

      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError(err.message));
      } else if (err.name === "CastError") {
        next(new BadRequestError('Invalid data'));
      } else {
        next(err);
      }
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
        next(new NotFoundError('Data not found'))
      }

      if (err.name === "CastError") {
        next(new BadRequestError('Invalid data'))
      } else {
        next(err);
      }
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
        next(new NotFoundError('Data not found'))
      }

      if (err.name === "CastError") {
        next(new BadRequestError('Invalid data'))
      } else {
        next(err);
      }
    })
}

module.exports = { getItems, createItem, likeItem, dislikeItem, deleteItem };