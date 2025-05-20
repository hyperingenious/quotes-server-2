import multer from "multer";
import { add_feedback_entry } from "../appwrite/add/add_appwrite";
import { upload_file_with_url } from "../appwrite/upload/upload_appwrite";
import { invalidateToken } from "../helpers/helper";
import fs from 'fs';
import path from 'path';

const storage = multer.diskStorage({
    destination: (lkajdslkfj, ldskjf, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (_, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });
import {Request, Response, } from 'express'
async function feedbackJI(req:Request, res:Response) {
    try {
        const verifiedToken = await invalidateToken({ req, res });
        const feedback = req.body.feedback;
        // @ts-ignore
        const email = verifiedToken.email;

        // @ts-ignore
        const user_id = verifiedToken.sub;

        let image_link = null;
        if (req.file) {
            const filePath = path.join(__dirname, '../uploads', req.file.filename);

        // @ts-ignore
            image_link = await upload_file_with_url(filePath, req.file.originalname);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error("Error deleting file:", err);
                }
            });
        }

        await add_feedback_entry({ feedback, email, user_id, })
        res.status(200).json({ message: "Feedback sent successfully!" })
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ error: "Unknown", message: "Internal Server Errro" })
    }


}
const feedback = [upload.single('screenshot'), feedbackJI]
export default feedback