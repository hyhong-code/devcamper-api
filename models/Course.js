const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a course title"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  weeks: {
    type: String,
    required: [true, "Please add number of weeks"],
  },
  tuition: {
    type: Number,
    required: [true, "Please add a tuition cost"],
  },
  minimumSkill: {
    type: String,
    required: [true, "Please add a minimum skill"],
    enum: ["beginner", "intermediate", "advanced"],
  },
  scholarshipAvaliable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Types.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
});

CourseSchema.statics.getAverageCost = async function (bootcampId) {
  // Calculate average with aggregate
  // result format: [ { _id: 5d713995b721c3bb38c1f5d0, averageCost: 10000 } ]
  const result = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    { $group: { _id: "$bootcamp", averageCost: { $avg: "$tuition" } } },
  ]);

  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(result[0].averageCost / 10) * 10,
    });
  } catch (error) {
    console.error(error);
  }
};

// Calculate avg cost after saving
CourseSchema.post("save", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

// Calculate avg cost befor removing
CourseSchema.pre("remove", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model("Course", CourseSchema);
