const router = require("express").Router();
const auth = require('../middlewares/auth')
const { getCurrentUser, updateUser } = require('../controllers/users')

// router.get('/', getUsers);

router.use(auth);
router.get('/me', auth, getCurrentUser);
router.patch('/me', auth, updateUser);

// router.post('/', createUser);

module.exports = router;



