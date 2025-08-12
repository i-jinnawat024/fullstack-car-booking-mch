const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {list, update, create, read} = require('../Controllers/user');

router.get('/user/:id', auth, read);
router.post('/user/update/:id', update);
router.post('/user',  create);
// router.delete('/user:id', remove);
module.exports = router;
