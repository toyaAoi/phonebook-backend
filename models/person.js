const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const url = process.env.MONGODB_URI;

console.log("connecting to mongodb...");

mongoose
  .connect(url)
  .then((response) => {
    console.log("conntected to mongodb");
  })
  .catch((error) => {
    console.log("error connecting to mongodb:", error.message);
  });

const personSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Name required"], minLength: 3 },
  number: {
    type: String,
    validate: {
      validator: function (v) {
        return /^(\d{2,3}-\d{5,})$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
    required: [true, "Phone number required"],
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
