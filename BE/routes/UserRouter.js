const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../db/userModel");
const requireLogin = require("../middleware/auth");
const router = express.Router();

router.get("/list", requireLogin, async (request, response) => {
  try {
    const users = await User.find({}, "_id first_name last_name").lean();
    response.status(200).json(users);
  } catch (error) {
    response.status(500).json({ message: "Unable to fetch user list." });
  }
});

router.get("/:id", requireLogin, async (request, response) => {
  const { id } = request.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    response.status(400).json({ message: `Invalid user id: ${id}.` });
    return;
  }

  try {
    const user = await User.findById(
      id,
      "_id first_name last_name location description occupation",
    ).lean();

    if (!user) {
      response.status(400).json({ message: `No user found with id: ${id}.` });
      return;
    }

    response.status(200).json(user);
  } catch (error) {
    response.status(500).json({ message: "Unable to fetch user detail." });
  }
});

router.post("/", async (request, response) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = request.body;

  if (!login_name || !login_name.trim()) {
    return response.status(400).send("login_name is required.");
  }
  if (!password || !password.trim()) {
    return response.status(400).send("password is required.");
  }
  if (!first_name || !first_name.trim()) {
    return response.status(400).send("first_name is required.");
  }
  if (!last_name || !last_name.trim()) {
    return response.status(400).send("last_name is required.");
  }

  try {
    const existingUser = await User.findOne({ login_name: login_name });
    if (existingUser) {
      return response.status(400).send("login_name already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      login_name: login_name,
      password: hashedPassword,
      first_name: first_name,
      last_name: last_name,
      location: location || "",
      description: description || "",
      occupation: occupation || ""
    });

    await newUser.save();
    return response.status(200).json({ login_name: newUser.login_name });
  } catch (error) {
    console.error("Error registering user:", error);
    return response.status(400).send("Error occurred during registration.");
  }
});

module.exports = router;
