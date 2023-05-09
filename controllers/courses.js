const Course = require("../models/Course.js");
const Bootcamp = require("../models/Bootcamp.js");
const errorResponse = require("../utils/errorResponse.js");
const asyncHandler = require("../middleware/async.js");

//@desc     Get all courses
//@route    GET /api/v1/courses
//@route    GET /api/v1/bootcamps/bootcampId/courses
//@access   Public

exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    return res
      .status(200)
      .json({ success: true, count: courses.length, data: courses });
  } else {
    return res.status(200).json(res.advancedResults);
  }
});

//@desc     Get a single courses
//@route    GET /api/v1/courses/:id
//@access   Public

exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!course) {
    return next(new errorResponse(`No course with id ${req.params.id}!`, 404));
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

//@desc     Add a single courses
//@route    POST /api/v1/bootcamps/:bootcampId/courses
//@access   Private

exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new errorResponse(`No bootcamp with id ${req.params.bootcampId}!`, 404)
    );
  }

  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course,
  });
});

//@desc     Update a single courses
//@route    PUT /api/v1/courses/:id
//@access   Private

exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new errorResponse(`No course with id ${req.params.id}!`, 404));
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

//@desc     Delete a single courses
//@route    DELETE /api/v1/courses/:id
//@access   Private

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new errorResponse(`No course with id ${req.params.id}!`, 404));
  }

  await course.deleteOne();

  //remove() does not work?

  res.status(200).json({
    success: true,
    data: {},
  });
});
