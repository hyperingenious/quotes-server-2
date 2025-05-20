import multer from "multer";
import parse from "./upload/parse";
import path from "path";
import fs from "fs";
import { getTokenCount } from "../parser/text_to_token_len";

/**
 * Multer storage engine configuration for storing uploaded files.
 */
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

/**
 * Multer instance with the configured storage engine.
 */
const upload = multer({ storage: storage });
import {Request, Response, } from 'express'
async function getTokenPlan(req:Request, res:Response) {
  const mimetype = req.body.mimetype;
  // @ts-ignore
  const filepath = path.resolve(req.file.path);
  const text = await parse({ mimetype, filepath }) || "";

  const tokenCount = await getTokenCount(text);

  if (tokenCount < 50_000) {
    await fs.promises.unlink(filepath);
    res.status(400).send("Your book should at-least be 100 page long");
    return 
  }

  const iteration = Math.floor(tokenCount / 50_000);
  const possiblePercentangeJump = 100 / iteration;
  res.status(200).json({
    possiblePercentangeJump,
    blogCoung: 6,
    tokenCount,
  });
}

const tokenPlan = [upload.single("pdf"), getTokenPlan];

export default tokenPlan;
