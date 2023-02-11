const { Router } = require('express');
const authController = require('../controllers/authController');
const {requireAuth} = require('../middleware/authMiddleware')
const router = Router();

router.get('/', requireAuth, authController.home_get )
router.post('/', requireAuth, authController.home_post )
router.get('/signup', authController.signup_get);
router.post('/signup', authController.signup_post);
router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
router.get('/logout', authController.logout_get);
router.get('/dbget/:id',authController.dbdata_get);

module.exports = router;