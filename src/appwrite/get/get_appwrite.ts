import {
  DATABASE_ID,
  CHUNKS_COLLECTION_ID,
  databases,
  CONTENT_DELETION_COLLECTION_ID,
  BOOKS_COLLECTION_ID,
  BLOGS_COLLECTION_ID,
  SUBSCRIPTIONS_COLLECTION_ID,
  INITIATED_TRANSACTIONS_COLLECTION_ID,
  FREE_CONTENT_GENERATION_ENTRIES,
  IMAGES_WITH_METADATA_COLLECTION_ID,
} from "../appwrite";
import { Models, Query } from "node-appwrite";
import { verify_token } from "../verify/verify_appwrite";
import {
  GetAllBooks,
  GetAllUserInitiatedTransations,
  GetAllUserSubscription,
  GetBookDocumentById,
  GetFreeContentCount,
  GetImagesWithKeywordsMatch,
} from "./get_appwrite_interface";

async function get_free_content_count({ type, user_id }: GetFreeContentCount) {
  try {
    const { total } = await databases.listDocuments(
      DATABASE_ID,
      FREE_CONTENT_GENERATION_ENTRIES,
      [
        Query.select(["$id"]),
        Query.equal("user_id", user_id),
        Query.equal("type", type),
        Query.limit(298938),
      ]
    );
    return total;
  } catch (error) {
    throw error;
  }
}

async function get_chunk_by_id(chunk_id: string) {
  console.log(`Getting chunk by ID: ${chunk_id}`);
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      CHUNKS_COLLECTION_ID,
      chunk_id
    );
    console.log(`Chunk retrieved successfully:`, response.$id);
    return response;
  } catch (error) {
    throw error;
  }
}

async function get_all_chunk_ids_with_book_id(book_id: string) {
  console.log(`Getting all chunk IDs with book ID: ${book_id}`);
  try {
    const { total, documents } = await databases.listDocuments(
      DATABASE_ID,
      CHUNKS_COLLECTION_ID,
      [Query.equal("books", book_id), Query.select(["$id"]), Query.limit(300)]
    );

    console.log(`Found ${total} chunks.`);

    if (total == 0) return [];

    const chunkIds = documents.map((doc) => doc.$id);

    console.log(`Chunk IDs: ${chunkIds}`);

    return chunkIds;
  } catch (error) {
    throw error;
  }
}

async function get_book_document_by_id({
  bookId,
  user_id,
}: GetBookDocumentById) {
  console.log(`Getting book document by ID: ${bookId}`);
  try {
    const doc = await databases.getDocument(
      DATABASE_ID,
      BOOKS_COLLECTION_ID,
      bookId
    );
    console.log("Book document retrieved successfully:", doc);
    return doc;
  } catch (error) {
    throw error;
  }
}

async function get_all_books({
  token,
}: GetAllBooks): Promise<Models.Document[]> {
  console.log(`Getting all books for token: ${token}`);
  try {
    const {
      isTokenValid,
      related_data: [related_data],
    } = await verify_token({ token });

    if (!isTokenValid) {
      throw new Error("Invalid Token");
    }
    const { documents } = await databases.listDocuments(
      DATABASE_ID,
      BOOKS_COLLECTION_ID,
      [Query.equal("user_id", [related_data.user_id])]
    );

    console.log("Books retrieved successfully:");
    return documents;
  } catch (error) {
    throw error;
  }
}

async function get_all_deletion_entries() {
  console.log("Getting all deletion entries");
  try {
    const { documents } = await databases.listDocuments(
      DATABASE_ID,
      CONTENT_DELETION_COLLECTION_ID,
      [Query.limit(1000000)]
    );
    console.log("Deletion entries retrieved successfully:", documents);
    return documents;
  } catch (error) {
    throw error;
  }
}

async function get_all_blog_ids_match_book_id(bookId: string) {
  console.log(`Getting all blog IDs matching book ID: ${bookId}`);
  try {
    const { total, documents } = await databases.listDocuments(
      DATABASE_ID,
      BLOGS_COLLECTION_ID,
      [Query.equal("books", [bookId]), Query.limit(300)]
    );

    console.log(`Found ${total} blogs.`);

    if (total == 0) return [];
    const blogIds = documents.map((ddata) => ddata.$id);
    console.log(`Blog IDs: ${blogIds}`);
    return blogIds;
  } catch (error) {
    throw error;
  }
}

async function get_all_user_subscription({ user_id }: GetAllUserSubscription) {
  try {
    const { total, documents } = await databases.listDocuments(
      DATABASE_ID,
      SUBSCRIPTIONS_COLLECTION_ID,
      [Query.equal("user_id", user_id)]
    );
    return { total, documents };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function get_all_user_initiated_transations({
  user_id,
}: GetAllUserInitiatedTransations) {
  try {
    const { total, documents } = await databases.listDocuments(
      DATABASE_ID,
      INITIATED_TRANSACTIONS_COLLECTION_ID,
      [Query.equal("user_id", user_id)]
    );
    return { total, documents };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/* documentID === plink_id in initiated_transactions collection */
async function get_initiated_transaction_by_plink_id(plink_id: string) {
  try {
    console.log(plink_id);
    const document = await databases.getDocument(
      DATABASE_ID,
      INITIATED_TRANSACTIONS_COLLECTION_ID,
      plink_id
    );
    return document;
  } catch (error: any) {
    if (error?.response?.data?.message === "document not found") {
      return null; // Return null if document not found
    }
    console.error("Error in get_initiated_transaction_by_plink_id:", error);
    throw new Error(
      `Failed to get initiated transaction: ${
        error?.message || "Unknown error"
      }`
    );
  }
}

async function get_images_with_keywords_match({
  keywords_array,
}: GetImagesWithKeywordsMatch) {
  try {
    const data = await databases.listDocuments(
      DATABASE_ID,
      IMAGES_WITH_METADATA_COLLECTION_ID,
      [Query.contains("metadata", keywords_array), Query.limit(1)]
    );
    return data;
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      throw new Error(`Failed to get image keyword documents: ${error.message}`);
    }
    throw new Error('Failed to get image keyword documents: Unknown error');
  }
}

async function get_all_images_url() {
  try {
    const links = [];
    const { documents, total } = await databases.listDocuments(
      DATABASE_ID,
      IMAGES_WITH_METADATA_COLLECTION_ID,
      [Query.select(["image_link"]), Query.limit(1500)]
    );

    for (let i = 0; i < total; ++i) {
      links.push(documents[i].image_link);
    }

    return links;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export {
  get_images_with_keywords_match,
  get_all_chunk_ids_with_book_id,
  get_chunk_by_id,
  get_book_document_by_id,
  get_all_blog_ids_match_book_id,
  get_all_deletion_entries,
  get_all_books,
  get_all_user_subscription,
  get_initiated_transaction_by_plink_id,
  get_all_user_initiated_transations,
  get_free_content_count,
  get_all_images_url,
};
