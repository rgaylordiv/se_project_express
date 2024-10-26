const router = require('express').Router();
const userRouter = require('./users')
const clothingItemRouter = require('./clothingItems')
const { documentNotFoundError } = require('../utils/errors');
const { login, createUser } = require('../controllers/users');
const { validateUsers, validateAuthentication } = require('../middlewares/validation')
//Joi needs to be added after auth

router.post('/signin', validateAuthentication, login);
router.post('/signup', validateUsers, createUser);
router.use('/users', userRouter);
router.use('/items', clothingItemRouter);
router.use((req, res) => {
  res.status(documentNotFoundError).send({ message: 'Router not found' })
})

module.exports = router;