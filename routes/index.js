const router = require('express').Router();
const userRouter = require('./users')
const clothingItemRouter = require('./clothingItems')
const NotFoundError  = require('../utils/NotFoundError');
const { login, createUser } = require('../controllers/users');
const { validateUsers, validateAuthentication } = require('../middlewares/validation')

router.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Server will crash now');
  }, 0);
});// remove after review
router.post('/signin', validateAuthentication, login);
router.post('/signup', validateUsers, createUser);
router.use('/users', userRouter);
router.use('/items', clothingItemRouter);
router.use(() => {
  throw new NotFoundError('Router not found' );
})

module.exports = router;