const Bootcamp = require('../models/Bootcamp.js');
const errorResponse = require('../utils/errorResponse.js');
const asyncHandler = require('../middleware/async.js');
const geoCoder = require('../utils/geocoder.js');

//@desc     Get all bootcamps
//@route    GET /api/v1/bootcamps
//@access   Public

exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;
  let queryStr = JSON.stringify(req.query);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `${match}`);

  query = Bootcamp.find(JSON.parse(queryStr));

  const bootcamps = await query;

  res
    .status(200)
    .json({ sucess: true, count: bootcamps.length, data: bootcamps });
});

//@desc     Get single bootcamp
//@route    GET /api/v1/bootcamps/:id
//@access   Public

exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new errorResponse(`Bootcamp with id ${req.params.id} not found`, 404)
    );
  }

  res.status(200).json({ sucess: true, data: bootcamp });
});

//@desc     Create new bootcamps
//@route    POST /api/v1/bootcamps/
//@access   Private

exports.createBootcamp = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    sucess: true,
    data: bootcamp,
  });
});

//@desc     Update single bootcamp
//@route    PUT /api/v1/bootcamps/:id
//@access   Private

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
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
});

//@desc     Delete single bootcamp
//@route    DELETE /api/v1/bootcamps/:id
//@access   Private

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    return next(
      new errorResponse(`Bootcamp with id ${req.params.id} not found`, 404)
    );
  }
  res.status(200).json({ sucess: true, data: {} });
});

//@desc     Get bootcamps within a radius
//@route    GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access   Private

exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  const loc = await geoCoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  //Calculate radius
  // Earth radius = 6378.1 Kilometers
  const radius = distance / 6378.1;
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});
