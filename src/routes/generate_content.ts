/**
 * Imports necessary modules for retrieving chunk IDs, generating AI content, and file system operations.
 */
import { get_all_chunk_ids_with_book_id } from "../appwrite/get/get_appwrite";
import { ai_blog_generator } from "../ai/ai_blog_generator";
import crypto from "crypto";
import { createFileFromRandomChunksGenerateContent } from "../parser/createFileFromRandomChunks";
import { invalidateToken } from "../helpers/helper";
import fs from "fs/promises";

/**
 * Asynchronous function to generate content for a given book ID.
 * @param {object} req - The request object containing the book ID in the query parameters.
 * @param {object} res - The response object used to send the API response.
 */
import { Request, Response, NextFunction } from "express";
async function generateContent(req: Request, res: Response, next: NextFunction) {
  console.log(req.query);

  // @ts-ignore
  const { id: book_id } = req.query;
  // @ts-ignore
  const subscriptionQuota = req.subscriptionQuota;

  /**
   * Verifies the user's token using the invalidateToken helper function to ensure authentication.
   */
  const verifiedToken = await invalidateToken(req, res, next);

  /**
   * Checks if a book ID is provided in the request. Returns a 400 error if not.
   */
  if (!book_id) {
    res.status(400).json({ message: "Book ID is required" });
    return 
  }

  console.log(
    `📥 Received request to generate content for book ID: ${book_id}`
  );

  /**
   * Responds immediately to prevent Heroku's 30s timeout (H12 error).
   */
  res.status(202).json({ message: "Processing started. Check back later." });

  /**
   * Runs processing in the background without blocking the request.
   */
  (async () => {
    let filePath;
    try {
      /**
       * Retrieves all chunk IDs associated with the specified book ID from the Appwrite database.
       */
      // @ts-ignore
      const chunkIds = await get_all_chunk_ids_with_book_id(book_id);

      /**
       * Checks if any chunks were found for the given book ID. If none, logs a message and exits.
       */
      if (chunkIds.length === 0) {
        console.log(`No chunks found for book ID: ${book_id}`);
        return;
      }

      /**
       * Creates a temporary file from the retrieved chunks.
       */
      filePath = await createFileFromRandomChunksGenerateContent(chunkIds);

      /**
       * Generates AI content using the ai_blog_generator function with a unique file name.
       */
      const random_cache_model_name = `${crypto.randomUUID()}`;
      await ai_blog_generator({
        subscriptionQuota,
        filePath,
        displayName: random_cache_model_name,

        //@ts-ignore
        bookEntryId: book_id,
        //@ts-ignore

        user_id: verifiedToken.sub,
      });

      console.log(`✅ Content generated successfully for book ID: ${book_id}`);
    } catch (error) {
      console.error(`❌ Error processing book ID ${book_id}:`, error);
    } finally {
      // Cleanup: delete the created file if it exists
      if (filePath) {
        try {
          await fs.unlink(filePath);
          console.log(`🗑️ Deleted temporary file: ${filePath}`);
        } catch (cleanupError: any) {
          // 'cleanupError' is of type 'unknown', so we need to safely access its message
          const message =
            cleanupError &&
            typeof cleanupError === "object" &&
            "message" in cleanupError
              ? (cleanupError as any).message
              : String(cleanupError);
          console.error(`⚠️ Error deleting file: ${message}`);
        }
      }
    }
  })();
}

/**
 * Exports the generateContent function to be used in other modules.
 */
export { generateContent };
