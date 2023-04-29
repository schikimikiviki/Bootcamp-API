const express = require('express');
const router = express.Router();

const {
	getBootcamps,
	getBootcamp,
	updateBootcamp,
	createBootcamp,
	deleteBootcamp,
} = require('../controllers/bootcamps.js');

router.route('/').get(getBootcamps).post(createBootcamp);

router
	.route('/:id')
	.get(getBootcamp)
	.put(updateBootcamp)
	.delete(deleteBootcamp);

module.exports = router;
