const Bootcamp = require('../models/Bootcamp');
const errorResponse = require('../utils/errorResponse');
//@desc     Get all bootcamps
//@route    GET /api/v1/bootcamps
//@access   Public

exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find();
    res
      .status(200)
      .json({ sucess: true, count: bootcamps.length, data: bootcamps });
  } catch (err) {
    next(err);
  }
};

//@desc     Get single bootcamp
//@route    GET /api/v1/bootcamps/:id
//@access   Public

exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
      return next(
        new errorResponse(`Bootcamp with id ${req.params.id} not found`, 404)
      );
    }

    res.status(200).json({ sucess: true, data: bootcamp });
  } catch {
    next(new errorResponse(`Bootcamp with id ${req.params.id} not found`, 404));
  }
};

//@desc     Create new bootcamps
//@route    POST /api/v1/bootcamps/
//@access   Private

exports.createBootcamp = async (req, res, next) => {
  try {
    console.log(req.body);
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
      sucess: true,
      data: bootcamp,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

//@desc     Update single bootcamp
//@route    PUT /api/v1/bootcamps/:id
//@access   Private

exports.updateBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!bootcamp) {
      return next(
        new errorResponse(`Bootcamp with id ${req.params.id} not found`, 404)
      );
    }

    res.status(200).json({ sucess: true, data: bootcamp });
  } catch (err) {
    next(err);
  }
};

//@desc     Delete single bootcamp
//@route    DELETE /api/v1/bootcamps/:id
//@access   Private

exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if (!bootcamp) {
      return next(
        new errorResponse(`Bootcamp with id ${req.params.id} not found`, 404)
      );
    }
    res.status(200).json({ sucess: true, data: {} });
  } catch (err) {
    next(err);
  }
};
