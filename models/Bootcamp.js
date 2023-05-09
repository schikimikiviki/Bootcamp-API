const mongoose = require("mongoose");
const slugify = require("slugify");
const geoCoder = require("../utils/geocoder");

const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name cannot have more than 50 characters"],
    },

    slug: String,
    description: {
      type: String,
      required: [true, "Please provide a description"],
      unique: true,
      trim: true,
      maxlength: [500, "Description cannot have more than 500 characters"],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "Please use a valid URL",
      ],
    },
    phone: {
      type: String,
      maxlength: [20, "Phone number cannot be longer than 20 characters"],
    },
    email: {
      type: String,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide valid E-Mail",
      ],
    },
    address: {
      type: String,
      required: [true, "Please provide adress"],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: false,
      },
      coordinates: {
        type: [Number],
        required: false,
        index: "2dsphere",
      },
      formattedAdress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    carreers: {
      type: [String],
      required: true,
      enum: [
        "Web Development",
        "Mobile Development",
        "UX/UI",
        "Data Science",
        "Business",
        "Other",
      ],
    },
    averageRating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [10, "Rating cannot exceed 10"],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: "no-photo.jpeg",
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// create bootcamp slug from name

BootcampSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  console.log("Slugify ran", this.name);
  next();
});

// Geocode and create location field
BootcampSchema.pre("save", async function (next) {
  const loc = await geoCoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAdress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };

  // Do not save adress in DB

  this.address = undefined;
  next();
});

//courses should be deleted when bootcamp is deleted

//this causes error for some reason

// BootcampSchema.pre("remove", async function (next) {
//   console.log("Remove middleware triggered!");
//   console.log(`Courses being removed from bootcamp ${this._id}`);
//   await this.model("Course").deleteMany({ bootcamp: this._id });
//   next();
// });

// reverse populate with virtuals
BootcampSchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "bootcamp",
  justOne: false,
});

module.exports = mongoose.model("Bootcamp", BootcampSchema);
