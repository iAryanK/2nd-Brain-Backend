import mongoose, { Schema, model } from "mongoose";
import { connectToDB } from "./db";

connectToDB();

const userSchema = new Schema({
  username: { type: String, unique: true },
  password: { type: String, required: true },
});

export const UserModel = model("User", userSchema);

const contentSchema = new Schema({
  type: { type: String },
  link: { type: String },
  title: { type: String },
  tags: { type: mongoose.Schema.Types.ObjectId, ref: "Tag" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

export const ContentModel = model("Content", contentSchema);

const linkSchema = new Schema({
  hash: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
});

export const linkModel = model("Link", linkSchema);
