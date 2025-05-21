import {
  DATABASE_ID,
  databases,
  BLOGS_COLLECTION_ID,
  BOOKS_COLLECTION_ID,
} from "../appwrite";
import sdk from "node-appwrite";
import { verify_token } from "../verify/verify_appwrite";
import { ListAllBlogs } from "./list_appwrite_interface";

async function list_all_blogs({ token, book_id }: ListAllBlogs) {
  console.log(`Listing all blogs for token: ${token}, book ID: ${book_id}`);
  try {
    const response = await verify_token({ token });
    if (!response) throw Error("Invalid Token");
    const { documents } = await databases.listDocuments(
      DATABASE_ID,
      BLOGS_COLLECTION_ID,
      [
        sdk.Query.equal(
          "user_id",
          response.related_data ? response.related_data[0].user_id : ""
        ),
        sdk.Query.equal("books", book_id),
      ]
    );

    console.log("Blogs retrieved successfully:");
    return documents;
  } catch (error) {
    throw error;
  }
}

async function list_all_book_ids_with_user_id(
  user_id: string
): Promise<string[] | void> {
  console.log(`Listing all book IDs with user ID: ${user_id}`);
  try {
    const { total, documents } = await databases.listDocuments(
      DATABASE_ID,
      BOOKS_COLLECTION_ID,
      [
        sdk.Query.equal("user_id", [user_id]),
        sdk.Query.select(["$id"]),
        sdk.Query.limit(300),
      ]
    );
    console.log(`Found ${total} books.`);
    if (total == 0) return;
    const bookIds = documents.map((doc) => doc.$id);
    console.log(`Book IDs: ${bookIds}`);
    return bookIds;
  } catch (error) {
    throw error;
  }
}

export { list_all_blogs, list_all_book_ids_with_user_id };
