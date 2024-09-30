const router = require('express').Router();
const userRouter = require('./users')
const clothingItemRouter = require('./clothingItems')
const { documentNotFoundError } = require('../utils/errors');

router.use('/users', userRouter);
router.use('/items', clothingItemRouter);
router.use((req, res) => {
  res.status(documentNotFoundError).send({ message: 'Router not found' })
})

module.exports = router;