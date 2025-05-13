import { DATABASE_ID, TOKENISATION_COLLECTION_ID, databases }  from "../appwrite";
import {Query}from "node-appwrite";

async function verify_token({ token }:VerifyToken) {
    console.log(`Verifying token: ${token}`);
    try {
        const { documents } = await databases.listDocuments(DATABASE_ID, TOKENISATION_COLLECTION_ID,
            [Query.equal("token", token)]
        )
        if (documents.length === 0) {
            console.log("Invalid token.");
            return { isTokenValid: false, related_data: null }
        } else {
            console.log("Token verified successfully.");
            return { isTokenValid: true, related_data: documents }
        }
    } catch (error) {
        throw error
    }
}

export  {
    verify_token
} 