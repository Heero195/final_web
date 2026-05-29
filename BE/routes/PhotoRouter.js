const express = require("express");
const mongoose = require("mongoose");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const requireLogin = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../images"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "UPL_" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get("/photosOfUser/:id", requireLogin, async (request, response) => {
  const { id } = request.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    response.status(400).json({ message: `Invalid user id: ${id}.` });
    return;
  }

  try {
    const targetUser = await User.findById(id, "_id").lean();
    if (!targetUser) {
      response.status(400).json({ message: `No user found with id: ${id}.` });
      return;
    }

    const photos = await Photo.find(
      { user_id: id },
      "_id user_id comments file_name date_time",
    ).lean();

    const commentUserIds = [
      ...new Set(
        photos.flatMap((photo) =>
          (photo.comments || []).map((comment) => String(comment.user_id)),
        ),
      ),
    ];

    const commentUsers = commentUserIds.length
      ? await User.find(
          { _id: { $in: commentUserIds } },
          "_id first_name last_name",
        ).lean()
      : [];

    const commentUserMap = new Map(
      commentUsers.map((user) => [String(user._id), user]),
    );

    const apiPhotos = photos.map((photo) => ({
      _id: photo._id,
      user_id: photo.user_id,
      file_name: photo.file_name,
      date_time: photo.date_time,
      comments: (photo.comments || []).map((comment) => ({
        _id: comment._id,
        comment: comment.comment,
        date_time: comment.date_time,
        user: commentUserMap.get(String(comment.user_id)) || {
          _id: comment.user_id,
          first_name: "Unknown",
          last_name: "User",
        },
      })),
    }));

    response.status(200).json(apiPhotos);
  } catch (error) {
    response.status(500).json({ message: "Unable to fetch user photos." });
  }
});

router.post("/commentsOfPhoto/:photo_id", requireLogin, async (request, response) => {
  const { photo_id } = request.params;
  const { comment } = request.body;

  if (!comment || comment.trim() === "") {
    return response.status(400).json({ message: "Comment cannot be empty." });
  }

  if (!mongoose.Types.ObjectId.isValid(photo_id)) {
    return response.status(400).json({ message: `Invalid photo id: ${photo_id}.` });
  }

  try {
    const photo = await Photo.findById(photo_id);
    if (!photo) {
      return response.status(400).json({ message: `No photo found with id: ${photo_id}.` });
    }

    const newComment = {
      comment: comment,
      user_id: request.session.user_id,
      date_time: new Date()
    };

    if (!photo.comments) {
      photo.comments = [];
    }
    photo.comments.push(newComment);
    await photo.save();

    return response.status(200).json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    return response.status(500).json({ message: "Unable to add comment." });
  }
});

router.post("/photos/new", requireLogin, upload.single("uploadedphoto"), async (request, response) => {
  if (!request.file) {
    return response.status(400).json({ message: "No photo file provided." });
  }

  try {
    const newPhoto = new Photo({
      file_name: request.file.filename,
      user_id: request.session.user_id,
      date_time: new Date(),
      comments: []
    });

    await newPhoto.save();
    return response.status(200).json(newPhoto);
  } catch (error) {
    console.error("Error uploading photo:", error);
    return response.status(500).json({ message: "Unable to upload photo." });
  }
});

module.exports = router;
