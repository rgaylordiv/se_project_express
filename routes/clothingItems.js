const router = require("express").Router();
const auth = require('../middlewares/auth')
const { getItems, createItem, likeItem, dislikeItem, deleteItem } = require('../controllers/clothingItems')

router.get('/', getItems);

router.use(auth);

router.post('/', auth, createItem);

router.put('/:itemId/likes', auth, likeItem);

router.delete('/:itemId/likes', auth, dislikeItem);

router.delete('/:itemId', auth, deleteItem);

module.exports = router;