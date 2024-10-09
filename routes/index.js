const router = require('express').Router();
const userRouter = require('./users')
const clothingItemRouter = require('./clothingItems')
const { documentNotFoundError } = require('../utils/errors');
const { login, createUser } = require('../controllers/users');

router.post('/signin', login);
router.post('/signup', createUser);
router.use('/users', userRouter);
router.use('/items', clothingItemRouter);
router.use((req, res) => {
  res.status(documentNotFoundError).send({ message: 'Router not found' })
})

module.exports = router;