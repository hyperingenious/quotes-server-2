import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "@google/genai";

import {
  BLOG_GENERATION_TIMER,
  BLOG_QUERY,
  SYSTEM_INSTRUCTIONS,
  BLOG_QUERY_NO_REPEAT,
} from "../config/config";

import { add_blog } from "../appwrite/add/add_appwrite";
import {
  databases,
  DATABASE_ID,
  SUBSCRIPTION_QUOTA_COLLECTION_ID,
} from "../appwrite/appwrite";
import { get_a_image_link } from "../helpers/brute";
import { Models } from "node-appwrite";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
let generatedBlogTitles: string[] = [];

interface FetchBlogs {
  subscriptionQuota: Models.Document;
  genBlog: () => Promise<string>;
  bookEntryId: string;
  user_id: string;
  count?: number;
  subscription: string;
}

async function fetchBlogs({
  subscriptionQuota,
  genBlog,
  bookEntryId,
  user_id,
  count = 6,
  subscription,
}: FetchBlogs) {
  try {
    for (let i = 0; i < count; i++) {
      await new Promise((resolve) =>
        setTimeout(resolve, BLOG_GENERATION_TIMER)
      );
      let blog;

      try {
        blog = await genBlog();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`Failed to generate blog ${i + 1}:`, errorMessage);
        blog =
          "[Placeholder blog due to temporary error - AI service unavailable]";
      }

      const blogImageUrl = get_a_image_link();

      await add_blog({
        blog,
        book_id: bookEntryId,
        user_id,
        blog_image: blogImageUrl,
      });

      if (subscription !== "unpaid") {
        console.log(`Subscription Quota updated by: ${i + 1}`);
        await databases.updateDocument(
          DATABASE_ID,
          SUBSCRIPTION_QUOTA_COLLECTION_ID,
          subscriptionQuota.$id,
          {
            blogs_generated: subscriptionQuota.blogs_generated + (i + 1),
          }
        );
        console.log(`Generated/Uploaded ${i + 1} blog successfully`);
      }
    }
  } catch (error) {
    console.error(
      "fetchBlogs encountered an unexpected error:",
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}
interface AIBlogGenerator {
  subscriptionQuota: Models.Document;
  filePath: string;
  bookEntryId: string;
  user_id: string;
  subscription: string;
}
async function ai_blog_generator({
  subscriptionQuota,
  filePath,
  bookEntryId,
  user_id,
  subscription,
}: AIBlogGenerator) {
  try {
    const doc = await ai.files.upload({
      file: filePath,
      config: { mimeType: "text/plain" },
    });
    console.log("Uploaded file name:", doc.name);

    const modelName = "gemini-1.5-flash-002";
    const systemInstruction = SYSTEM_INSTRUCTIONS;
    const query = BLOG_QUERY;
    const noRepeatBlogQuery = BLOG_QUERY_NO_REPEAT;

    const cache = await ai.caches.create({
      model: modelName,
      config: {
        contents: createUserContent(
          createPartFromUri(doc.uri || "", doc.mimeType || "")
        ),
        systemInstruction,
      },
    });

    console.log("Cache created:", cache);

    const genBlog = async (): Promise<string> => {
      const modifedQueryToPreventBlogRepetetion =
        generatedBlogTitles.length === 0
          ? query
          : `${noRepeatBlogQuery}${generatedBlogTitles.join(", Title:")}`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: modifedQueryToPreventBlogRepetetion,
        config: { cachedContent: cache.name },
      });

      const blog: string = response.text || "";
      generatedBlogTitles.push(blog.substring(0, 70));
      return blog;
    };

    await fetchBlogs({
      genBlog,
      user_id,
      bookEntryId,
      subscription,
      subscriptionQuota,
    });

    await ai.caches.delete({ name: cache.name || "" });
    console.log("Cache deleted successfully!!");
  } catch (error) {
    if (error instanceof Error) {
      console.error("ai_blog_generator failed:", error.message);
    } else {
      console.error("ai_blog_generator failed:", String(error));
    }
    throw error;
  }
}

export  { ai_blog_generator };
