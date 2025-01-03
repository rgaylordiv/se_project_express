const router = require("express").Router();
const auth = require('../middlewares/auth')
const { getCurrentUser, updateUser } = require('../controllers/users')
const { validateUpdatedUser } = require('../middlewares/validation')

router.get('/me', auth, getCurrentUser);
router.patch('/me', auth, validateUpdatedUser, updateUser);

module.exports = router;



