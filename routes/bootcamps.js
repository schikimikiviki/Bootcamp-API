const express = require("express");

const {
  getBootcamps,
  getBootcamp,
  updateBootcamp,
  createBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps.js");

const Bootcamp = require("../models/Bootcamp.js");
const advancedResults = require("../middleware/advancedResults.js");

// include other routers

const courseRouter = require("./courses.js");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth.js");

//re-route

router.use("/:bootcampId/courses", courseRouter);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorize("admin", "publisher"), createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize("admin", "publisher"), updateBootcamp)
  .delete(protect, authorize("admin", "publisher"), deleteBootcamp);

router
  .route(`/:id/photo`)
  .put(protect, authorize("admin", "publisher"), bootcampPhotoUpload);

module.exports = router;
