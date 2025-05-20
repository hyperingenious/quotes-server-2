import path from "path";
import fs from "fs";

function startup() {
  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(__dirname, "../uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
}
export  { startup };