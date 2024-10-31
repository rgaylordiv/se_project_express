const router = require("express").Router();
const auth = require('../middlewares/auth')
const { validateClothingItems, validateId } = require('../middlewares/validation')
// Joi needs to be added after auth
const { getItems, createItem, likeItem, dislikeItem, deleteItem } = require('../controllers/clothingItems')

router.get('/', getItems);

router.post('/', auth, validateClothingItems, createItem);
router.put('/:itemId/likes', auth, validateId, likeItem);
router.delete('/:itemId/likes', auth, validateId, dislikeItem);
router.delete('/:itemId', auth, validateId, deleteItem);

module.exports = router;