import {
  DATABASE_ID,
  BOOKS_COLLECTION_ID,
  databases,
  CONTENT_DELETION_COLLECTION_ID,
  CHUNKS_COLLECTION_ID,
  BLOGS_COLLECTION_ID,
  storage,
  BUCKET_ID,
} from "../appwrite";
import {
  DeleteBlogEntryByIdAndToken,
  DeleteBookEntryById,
  DeleteBookEntryByIdAndToken,
  DeleteEverything,
  MakeAllDeletionEntries,
} from "./delete_appwrite_interface";

import {
  get_all_chunk_ids_with_book_id,
  get_all_blog_ids_match_book_id,
} from "../get/get_appwrite";
import { add_deletion_entry } from "../add/add_appwrite";
import { verify_token } from "../verify/verify_appwrite";
import { list_all_book_ids_with_user_id } from "../list/list_appwrite";

async function delete_chunk_by_id(el: string): Promise<void> {
  console.log(`Deleting chunk by ID: ${el}`);
  try {
    await databases.deleteDocument(DATABASE_ID, CHUNKS_COLLECTION_ID, el);
    console.log(`Chunk deleted successfully.`);
  } catch (e) {
    throw e;
  }
}

async function delete_blog_by_id(el: string): Promise<null> {
  console.log(`Deleting blog by ID: ${el}`);
  try {
    await databases.deleteDocument(DATABASE_ID, BLOGS_COLLECTION_ID, el);
    console.log("Blog deleted successfully.");
    return null;
  } catch (e) {
    throw e;
  }
}

async function delete_book_entry_by_id({
  bookId,
}: DeleteBookEntryById): Promise<null> {
  console.log(`Deleting book entry by ID: ${bookId}`);
  try {
    await databases.deleteDocument(DATABASE_ID, BOOKS_COLLECTION_ID, bookId);
    console.log("Book entry deleted successfully.");
    return null;
  } catch (error) {
    throw error;
  }
}

async function delete_file_by_id(el: string): Promise<null | void> {
  console.log(`Deleting file by ID: ${el}`);
  try {
    await storage.deleteFile(BUCKET_ID, el);
    console.log("File deleted successfully.");
    return null;
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}

async function delet_deletion_entry(id: string): Promise<null> {
  console.log(`Deleting deletion entry by ID: ${id}`);
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      CONTENT_DELETION_COLLECTION_ID,
      id
    );
    console.log("Deletion entry deleted successfully.");
    return null;
  } catch (error) {
    console.error("Error deleting deletion entry:", error);
    throw error;
  }
}
async function make_all_deletion_entries({
  documentId,
  file_id,
}: MakeAllDeletionEntries): Promise<null> {
  console.log(
    `Making all deletion entries for document ID: ${documentId}, file ID: ${file_id}`
  );
  try {
    const chunk_id_array = await get_all_chunk_ids_with_book_id(documentId);
    const blog_id_array = await get_all_blog_ids_match_book_id(documentId);

    await add_deletion_entry({ file_id, chunk_id_array, blog_id_array });
    console.log("Deletion entries made successfully.");
    return null;
  } catch (error) {
    throw error;
  }
}

async function delete_book_entry_by_id_and_token({
  token,
  documentId,
}: DeleteBookEntryByIdAndToken): Promise<null> {
  console.log(`Deleting book entry by ID: ${documentId} with token: ${token}`);
  try {
    const response = await verify_token({ token });
    if (!response) throw Error("Invalid Token");

    const { pdf_link: file_id } = await databases.getDocument(
      DATABASE_ID,
      BOOKS_COLLECTION_ID,
      documentId
    );

    await make_all_deletion_entries({ documentId, file_id });

    await databases.deleteDocument(
      DATABASE_ID,
      BOOKS_COLLECTION_ID,
      documentId
    );

    console.log("Book entry deleted successfully.");

    return null;
  } catch (error) {
    throw error;
  }
}

async function delete_blog_entry_by_id_and_token({
  token,
  documentId,
}: DeleteBlogEntryByIdAndToken) {
  console.log(`Deleting blog entry by ID: ${documentId} with token: ${token}`);
  try {
    const response = await verify_token({ token });
    if (!response) throw Error("Invalid Token");
    await databases.deleteDocument(
      DATABASE_ID,
      BLOGS_COLLECTION_ID,
      documentId
    );
    console.log("Blog entry deleted successfully.");
    return null;
  } catch (error) {
    throw error;
  }
}

async function delete_everything({ token }: DeleteEverything) {
  console.log(`Deleting everything for token: ${token}`);
  try {
    const response = await verify_token({ token });
    if (!response) throw Error("Invalid Token");
    const documents = await list_all_book_ids_with_user_id(
      response.related_data ? response.related_data[0].user_id : ""
    );

    if (documents && documents.length !== 0) {
      console.log(`Deleting ${documents.length} books.`);
      for (const doc of documents) {
        await delete_book_entry_by_id_and_token({ token, documentId: doc });
      }
      console.log("All entries deleted successfully.");
    } else {
      console.log("No books found to delete.");
    }
  } catch (error) {
    throw error;
  }
}

export {
  delete_chunk_by_id,
  delete_blog_by_id,
  delete_book_entry_by_id,
  delete_file_by_id,
  delet_deletion_entry,
  delete_blog_entry_by_id_and_token,
  delete_everything,
  delete_book_entry_by_id_and_token,
  make_all_deletion_entries,
};
