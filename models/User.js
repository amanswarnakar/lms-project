const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
});

const Task = mongoose.model("Task", taskSchema);

let tasks = [];

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  link: String,
  completed: {
    type: Boolean,
    default: false,
  },
});

const defaultCourses = [
  {
    title: "Learn HTML - Full Tutorial for Beginners (2022)",
    description:
      "Learn HTML in this complete course for beginners. This is an all-in-one beginner tutorial to help you learn web development skills. This course teaches HTML5.",
    link: "https://youtube.com/embed/kUMe1FH4CHE",
  },
  {
    title: "CSS Tutorial - Zero to Hero (Complete Course)",
    description:
      "Learn CSS in this full course for beginners. CSS, or Cascading Style Sheet, is responsible for the styling and looks of a website.",
    link: "https://youtube.com/embed/1Rs2ND1ryYc",
  },
  {
    title: "JavaScript Programming - Full Course",
    description:
      "Learn JavaScript from scratch by solving over a hundred different coding challenges.",
    link: "https://youtube.com/embed/jS4aFq5-91M",
  },
  {
    title: "Python Tutorial for Beginners",
    description:
      "Learn the Python programming language in this beginner's crash course. You will learn everything from system set up to basic syntax to working with API's.",
    link: "https://youtube.com/embed/8124kv-632k",
  },
  {
    title: "Object Oriented Programming (OOP) in C++ Course",
    description:
      "Object Oriented Programming (OOP) is commonly used when writing code with C++. In this crash course, you will learn what OOP is and how to implement it using C++.",
    link: "https://youtube.com/embed/wN0x9eZLix4",
  },
  {
    title: "Data Structures - Full Course Using C and C++",
    description:
      "Learn about data structures in this comprehensive course. We will be implementing these data structures in C or C++.",
    link: "https://youtube.com/embed/B31LgI4Y4DQ",
  },
];

const Course = mongoose.model("Course", courseSchema);

const userSchema = new mongoose.Schema({
  username: String,
  email: {
    type: String,
    required: [true, "Please enter an email"],
    unique: true,
    lowercase: true,
    validate: [isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: [6, "Minimum password length is 6 characters"],
  },
  imgURL: String,
  name: {
    first: String,
    last: String,
  },
  tasks: [taskSchema],
  courses: {
    type: [courseSchema],
    default: [...defaultCourses],
  },
});

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Static method to login user
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email: email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error('incorrect password');
  }
  throw Error('incorrect email');
};

const User = mongoose.model('user', userSchema);

module.exports = User;
