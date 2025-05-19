import { Request, Response, NextFunction } from "express";
import fs from "fs";

async function checkFileMimetype(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // @ts-ignore
    const { mimetype } = req.body;

    // @ts-ignore
    const { subscription } = req;

    // @ts-ignore
    const filepath = req.file.path;

    if (mimetype !== "application/pdf" && !["reader"].includes(subscription)) {
      fs.unlink(filepath, (err) => {
        if (err) {
          console.error("Failed to delete file:", err);
        }
      });

      res.status(403).json({
        error: "Forbidden",
        message: "File type not allowed in your plan",
      });

      return;
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Something gone wrong on our side",
    });
  }
}

export default checkFileMimetype;
