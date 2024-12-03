import express from "express"; // require statement doesn't care about typescript
import jwt from "jsonwebtoken";
import { ContentModel, linkModel, UserModel } from "./models";
import { JWT_PASSWORD } from "./config";
import { userMiddleware } from "./middleware";
import { random } from "./utils";
require("dotenv").config();
import cors from "cors";

const app = express();
app.use(express.json()); // since we are expecting the body to be json
app.use(cors());

const port = process.env.PORT;

app.post("/api/v1/signup", async (req, res) => {
  try {
    // TODO: zod validation
    const username = req.body.username;
    const password = req.body.password;

    await UserModel.create({ username, password });

    res.json({
      message: "user signed up",
    });
  } catch (error) {
    res.status(403).json({ message: "user already exists" });
  }
});

app.post("/api/v1/signin", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const existingUser = await UserModel.findOne({
    username,
    password,
  });

  if (existingUser) {
    const token = jwt.sign(
      {
        id: existingUser._id,
      },
      JWT_PASSWORD
    );

    res.json({ token });
  } else res.status(403).json({ message: "invalid credentials" });
});

app.post("/api/v1/content", userMiddleware, (req, res) => {
  try {
    const type = req.body.type;
    const link = req.body.link;
    const title = req.body.title;
    const tags = req.body.tags;

    ContentModel.create({
      type,
      link,
      title,
      // @ts-ignore
      userId: req.userId,
    });
    res.json({ message: "content created" });
  } catch (error) {
    res.status(403).json({ message: "failed to create content" });
  }
});

app.get("/api/v1/content", userMiddleware, async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.userId;
    // populate only username from user (with given userId)
    const contents = await ContentModel.find({ userId }).populate(
      "userId",
      "username"
    );
    res.json({ contents });
  } catch (error) {
    res.status(500).json({ messsage: "failed to fetch content" });
  }
});

app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  const contentId = req.body.contentId;
  // @ts-ignore
  await ContentModel.deleteMany({ contentId, userId: req.userId });

  res.json({ message: "content deleted" });
});

app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  const { share } = req.body.share;
  if (share) {
    const existingLink = await linkModel.findOne({
      // @ts-ignore
      userId: req.userId,
    });
    if (existingLink) {
      res.json({
        hash: existingLink.hash,
      });
      return;
    }

    const hash = random(10);
    await linkModel.create({
      // @ts-ignore
      userId: req.userId,
      hash: hash,
    });

    res.json({
      message: "/share/" + hash,
    });
  } else {
    // @ts-ignore
    await linkModel.deleteOne({ userId: req.userId });

    res.json({
      message: "Removed link",
    });
  }
});

app.get("/api/v1/brain/:shareLink", async (req, res) => {
  const hash = req.params.shareLink;

  const link = await linkModel.findOne({
    hash,
  });

  if (!link) {
    res.status(411).json({ message: "Incorrect input" });
    return;
  }

  const content = await ContentModel.find({ userId: link.userId });

  const user = await UserModel.findOne({
    _id: link.userId,
  });

  if (!user) {
    res
      .status(411)
      .json({ message: "User not found, error should ideally not happen." });
    return;
  }

  res.json({ username: user.username, content: content });
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
