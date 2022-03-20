const User = require("../models/User");
const jwt = require("jsonwebtoken");

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "" };

  // incorrect email
  if (err.message === "incorrect email") {
    errors.email = "Email is not registered";
  }
  // incorrect password
  if (err.message === "incorrect password") {
    errors.password = "Incorrect password";
  }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = "Email is already registered";
    return errors;
  }
  // validation errors
  if (err.message.includes("user validation failed")) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET, {
    expiresIn: maxAge * 1000,
  });
};

module.exports.signup_get = (req, res) => {
  res.render("signup");
};
module.exports.login_get = (req, res) => {
  res.render("login");
};
module.exports.signup_post = async (req, res) => {
  const {
    firstName,
    lastName,
    telephone,
    imgURL,
    email,
    username,
    password1,
    password2,
  } = req.body;
  const name = {
    first: firstName,
    last: lastName,
  };
  try {
    const password = password1;
    const user = await User.create({
      name,
      telephone,
      imgURL,
      email,
      username,
      password,
    });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id, username: user.username });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });

    res.status(200).json({ user: user._id, username: user.username });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.get_tasks = (req, res) => {
  const username = req.params.username;
  User.findOne({ username: username }, (err, foundUser) => {
    if (err) console.log(err);
    else {
      res.render("tasks", {
        tasks: foundUser.tasks,
        username: foundUser.username,
      });
    }
  });
};

module.exports.post_task = (req, res) => {
  const username = req.params.username;
  let tasks = [];
  const newTask = {
    title: req.body.taskTitle,
    description: req.body.taskDescription,
  };
  tasks.push(newTask);

  User.findOneAndUpdate(
    { username: username },
    {
      $push: {
        tasks: tasks,
      },
    },
    (err, updatedUser) => {
      if (err) console.log(err);
      else {
        updatedUser.save();
        res.redirect(`/${username}/tasks`);
      }
    }
  );
};

module.exports.delete_task = (req, res) => {
  const username = req.params.username;
  const taskID = req.body.deleteTask;
  User.findOneAndUpdate(
    { username: username },
    {
      $pull: {
        tasks: { _id: taskID },
      },
    },
    () => {
      res.redirect("/" + username + "/tasks");
    }
  );
};

module.exports.get_profile = (req, res) => {
  const username = req.params.username;
  User.findOne({ username: username }, (err, foundUser) => {
    if (err) console.log(err);
    else {
      fullname = `${foundUser.name.first} ${foundUser.name.last}`;
      res.render("profile", {
        firstName: foundUser.name.first,
        lastName: foundUser.name.last,
        email: foundUser.email,
        username: foundUser.username,
        fullname: fullname,
        imgURL: foundUser.imgURL,
      });
    }
  });
};

module.exports.update_profile = (req, res) => {
  const username = req.params.username;
  const { firstName, lastName, email, imgURL } = req.body;

  User.findOneAndUpdate(
    { username: username },
    {
      "name.first": firstName,
      "name.last": lastName,
      email: email,
      imgURL: imgURL,
    },
    (err, updatedUser) => {
      if (err) console.log(err);
      else {
        updatedUser.save();
        res.redirect(`/${username}/profile`);
      }
    }
  );
};

module.exports.get_courses = (req, res) => {
  const username = req.params.username;
  User.findOne({ username: username }, (err, foundUser) => {
    if (err) console.log(err);
    else {
      res.render("courses", {
        courses: foundUser.courses,
        username: foundUser.username,
      });
    }
  });
};

module.exports.update_courses = (req, res) => {
  const username = req.params.username;
  const courseID = req.body.courseID;
  User.findOneAndUpdate(
    { username: username, "courses._id": courseID },
    {
      $set: {
        "courses.$.completed": true,
      },
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    },
    (err, updatedUser) => {
      if (err) console.log(err);
      else {
        updatedUser.save();
        res.redirect(`/${username}/courses`);
      }
    }
  );
};

module.exports.get_logout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
