import mongoose from "mongoose";
require("dotenv").config();

export const connectToDB = async () => {
  if (!process.env.MONGODB_URI) return console.log("🔴 [Missing MONGODB_URI]");

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "second_brain",
    });

    console.log("🚀 mongodb connected");
  } catch (error) {
    console.log("🔴 [DB CONNECTION FAILED]", error);
  }
};
