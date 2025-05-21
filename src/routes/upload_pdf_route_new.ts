import fs from "fs/promises";
import chunk from "chunk-text";
import path from "path";
import { createFileFromRandomChunks } from "../parser/createFileFromRandomChunks";
import { ai_blog_generator } from "../ai/ai_blog_generator";
import { upload_pdf } from "../appwrite/upload/upload_appwrite";
import parse from "./upload/parse";
import { add_upload_book_entry } from "../appwrite/add/add_appwrite";
import {
  databases,
  DATABASE_ID,
  FREE_CONTENT_GENERATION_ENTRIES,
} from "../appwrite/appwrite";
import { ID } from "node-appwrite";
import { Request, Response } from "express";
async function uploadPDFRouteNew(req: Request, res: Response) {
  try {
    const {
      category_id,
      blogCount,
      mimetype,
      authorName: author,
      bookTitle: book_name,
      imageUrl: book_image,
    } = req.body;
    // @ts-ignore
    const { verifiedToken, subscription } = req;

    // @ts-ignore
    const filepath = path.resolve(req.file.path);
    let text;
    try {
      text = (await parse({ mimetype, filepath })) || "";
    } catch (parseError) {
      console.error("Error parsing PDF file:", parseError);
      res.status(500).json({ message: "Failed to parse PDF file" });
      return;
    }

    const perContextPortion = 100 / (blogCount / 6);
    const times = blogCount / 6;
    const chunks = chunk(text, 10000);
    const texts = [];
    const cacheInterval = (chunks.length * perContextPortion) / 100;

    let bookPDFId;
    try {
      const uploadResult = await upload_pdf(filepath);
      bookPDFId = uploadResult.$id;
    } catch (uploadError) {
      console.error("Error uploading PDF to Appwrite:", uploadError);
      res.status(500).json({ message: "Failed to upload PDF to storage" });
      return;
    }

    /* Saved PDF link */
    const pdf_link = `https://cloud.appwrite.io/v1/storage/buckets/${process.env.BUCKET_ID}/files/${bookPDFId}/view?project=${process.env.APPWRITE_PROJECT_ID}&mode=admin`;

    /* Adding the book entry in the DB */
    const bookEntryData = {
      user_id: verifiedToken.sub,
      author,
      book_image,
      book_name,
      pdf_link,
      category: category_id,
    };

    let bookEntryId;
    try {
      const bookEntry = await add_upload_book_entry(bookEntryData);
      bookEntryId = bookEntry.$id;
    } catch (bookEntryError) {
      console.error("Error adding book entry to database:", bookEntryError);
      res
        .status(500)
        .json({ message: "Failed to save book entry in database" });
        return; }

    res
      .status(200)

      // @ts-ignore
      .json({ message: `File uploaded successfully: ${req.file.filename}` });

    for (let i = 0; i < times; ++i) {
      const startingIndex = i * cacheInterval;
      const chunksSlice = chunks.slice(
        startingIndex,
        startingIndex + cacheInterval
      );
      const tempChunkStore: string[] = [];
      chunksSlice.forEach((chunk) => tempChunkStore.push(chunk));
      texts.push(tempChunkStore);
    }

    const textFilePaths = [];
    try {
      for (let y = 0; y < texts.length; ++y) {
        const destination = await createFileFromRandomChunks(texts[y]);
        textFilePaths.push(destination);
      }
    } catch (chunkFileError) {
      console.error("Error creating chunk files:", chunkFileError);
      res
        .status(500)
        .json({ message: "Failed to generate chunk files for content" });
      return;
    }

    try {
      for (let g = 0; g < textFilePaths.length; ++g) {
        await ai_blog_generator({
          // @ts-ignore
          subscriptionQuota: req.subscriptionQuota,
          filePath: textFilePaths[g],
          bookEntryId,
          user_id: verifiedToken.sub,
          subscription,
        });
      }
    } catch (blogGenerationError) {
      console.error(
        "Error during blog generation process:",
        blogGenerationError
      );
      res
        .status(500)
        .json({ message: "Failed to generate blogs from content" });
      return;
    } finally {
      for (let kkr = 0; kkr < textFilePaths.length; ++kkr) {
        try {
          await fs.unlink(textFilePaths[kkr]);
        } catch (unlinkError) {
          console.warn(
            `Failed to delete temporary file ${textFilePaths[kkr]}:`,
            unlinkError
          );
        }
      }
    }

    console.log("Content generated successfully!");

    if (subscription === "unpaid") {
      try {
        for (let whatever = 0; whatever < blogCount; ++whatever) {
          await databases.createDocument(
            DATABASE_ID,
            FREE_CONTENT_GENERATION_ENTRIES,
            ID.unique(),
            {
              type: "blog",
              user_id: verifiedToken.sub,
            }
          );
        }

        await databases.createDocument(
          DATABASE_ID,
          FREE_CONTENT_GENERATION_ENTRIES,
          ID.unique(),
          {
            type: "book",
            user_id: verifiedToken.sub,
          }
        );
      } catch (quotaUpdateError) {
        console.error(
          "Error updating free content generation quota:",
          quotaUpdateError
        );
        res
          .status(500)
          .json({ message: "Failed to update free content generation quota" });
        return;
      }
    }
  } catch (error) {
    console.error("Unexpected error in uploadPDFRouteNew:", error);
    res
      .status(500)
      .json({ message: "Unexpected error occurred during upload process" });
    return;
  }
}

export default uploadPDFRouteNew;
