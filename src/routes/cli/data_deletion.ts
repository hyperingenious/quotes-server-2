import { delete_book_entry_by_id_and_token, delete_blog_entry_by_id_and_token, delete_everything, } from "../../appwrite/delete/delete_appwrite";

import { verify_token } from "../../appwrite/verify/verify_appwrite";

import {Request, Response, } from 'express'
async function dataDeletion(req:Request, res:Response) {
    const token = req.body.token;
    const deletionData = req.body.deletionData;

    console.log("Received dataDeletion request:", { token, deletionData });

    if (!token || !deletionData) {
        console.error("Missing required fields: 'token' or 'deletionData'");
        res.status(400).json({ error: "Missing required fields: 'token' or 'deletionData'" });
        return 
    }

    try {
        const isTokenValid = await verify_token({ token });
        if (!isTokenValid) {
            console.error("Invalid token provided.");
             res.status(400).json({ message: "Invalid token" });
            return
        }

        switch (deletionData.deletiontype) {
            case "delete_book":
                console.log("Deleting book with ID:", deletionData.bookId);
                await delete_book_entry_by_id_and_token({ token, documentId: deletionData.bookId });
                console.log("Book deleted successfully.");
                res.status(200).json({ message: 'Book deleted successfully' });
                return 

            case "delete_blog":
                console.log("Deleting blog with ID:", deletionData.blogId);
                await delete_blog_entry_by_id_and_token({ token, documentId: deletionData.blogId });
                console.log("Blog deleted successfully.");
                res.status(200).json({ message: 'Blog deleted successfully' });
                return 

            case "delete_everything":
                console.log("Deleting all data.");
                await delete_everything({ token });
                console.log("All data deleted successfully.");
                res.status(200).json({ message: 'All data deleted successfully' });
                return 
            default:
                console.error(`Unknown deletion type: '${deletionData.deletiontype}'`);
                res.status(400).json({ error: `Unknown deletion type: '${deletionData.deletiontype}'` });
                return 
        }
    } catch (err) {
        console.error("Error during data deletion:", err);
        let errorMessage = "An error occurred during data deletion";
        let details = "";
        if (err instanceof Error) {
            details = err.message;
        } else if (typeof err === "string") {
            details = err;
        } else {
            details = JSON.stringify(err);
        }
         res.status(500).json({ error: errorMessage, details });
        return
    }
}

export  { dataDeletion };