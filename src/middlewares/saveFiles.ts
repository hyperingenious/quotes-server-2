import multer from "multer";
import path from "path";

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
const saveFiles = upload.single("pdf")

export default saveFiles;