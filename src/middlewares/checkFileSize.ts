import { Request, Response, NextFunction } from "express";
import fs from "fs";
async function checkFileSize(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  try {
    // @ts-ignore
    const { subscription } = req;

    // @ts-ignore
    const fileSize = req.file.size;

    // @ts-ignore
    const filepath = req.file.path;

    //Check file size based on subscription
    const maxSize =
      subscription === "unpaid"
        ? 10500000
        : subscription === "reader"
        ? 21000000
        : 0; //Default to 0 for unsupported plans.

    console.log(fileSize);

    if (maxSize > 0 && fileSize > maxSize) {
      fs.unlink(filepath, (err) => {
        if (err) {
          console.error("Failed to delete file:", err);
        }
      });
      return res.status(400).json({
        error: "Bad Request",
        message: `File exceeded ${maxSize / 1000000}Mb try smaller`,
      });
    }
    next();
    return;
  } catch (error) {
    console.error("Error in checkFileSize middleware:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Something went wrong while checking file size.",
    });
  }
}
export default checkFileSize;
