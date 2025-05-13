import {
  DATABASE_ID,
  databases,
  CONTENT_DELETION_COLLECTION_ID,
  BOOKS_COLLECTION_ID,
  BLOGS_COLLECTION_ID,
  INITIATED_TRANSACTIONS_COLLECTION_ID,
  SUBSCRIPTIONS_COLLECTION_ID,
  SUBSCRIPTION_QUOTA_COLLECTION_ID,
  PURPLE_FEEDBACKS_COLLECTION_ID,
} from "../appwrite";
import { ID, Models } from "node-appwrite";
import {
  AddBlog,
  AddDeletionEntry,
  AddFeedBackEntry,
  AddInitiateTransactionEntry,
  AddSubscriptionEntry,
  AddSubscriptionQuota,
} from "./add_appwrite_interfaces";
import { BookEntryData } from "../../types/types";

async function add_deletion_entry({
  file_id,
  chunk_id_array,
  blog_id_array,
}: AddDeletionEntry): Promise<Models.Document> {
  console.log("Adding deletion entry:");
  console.log({ file_id, chunk_id_array, blog_id_array });
  const chunk_ids: string = JSON.stringify(chunk_id_array);
  const blog_ids: string = JSON.stringify(blog_id_array);

  try {
    const document = await databases.createDocument(
      DATABASE_ID,
      CONTENT_DELETION_COLLECTION_ID,
      ID.unique(),
      {
        chunk_ids,
        blog_ids,
        file_id,
      }
    );
    console.log("Deletion entry added successfully", document.$id);
    return document;
  } catch (error) {
    throw error;
  }
}

async function add_upload_book_entry(
  data_obj: BookEntryData
): Promise<Models.Document> {
  console.log("Adding book entry to database:", data_obj);
  try {
    const document = await databases.createDocument(
      DATABASE_ID,
      BOOKS_COLLECTION_ID,
      ID.unique(),
      data_obj
    );
    console.log(`Book entry added successfully. Document ID: ${document.$id}`);
    return document;
  } catch (error) {
    throw error;
  }
}

async function add_blogs(
  blogs_array: string[],
  book_id: string,
  user_id: string
): Promise<void> {
  console.log(
    `Adding ${blogs_array.length} blogs for book ID: ${book_id}, user ID: ${user_id}`
  );
  try {
    for (let i = 0; i < blogs_array.length; i++) {
      const blogResponse = await databases.createDocument(
        DATABASE_ID,
        BLOGS_COLLECTION_ID,
        ID.unique(),
        {
          blog_markdown: blogs_array[i],
          books: book_id,
          user_id,
        }
      );
      console.log(
        `Blog ${i + 1}/${blogs_array.length} added. Document ID: ${
          blogResponse.$id
        }`
      );
    }
    console.log("All blogs added successfully");
  } catch (error) {
    throw error;
  }
}

async function add_blog({
  blog,
  book_id,
  user_id,
  blog_image,
}: AddBlog): Promise<Models.Document> {
  console.log(`Adding blog for book ID: ${book_id}, user ID: ${user_id}`);
  try {
    const document = await databases.createDocument(
      DATABASE_ID,
      BLOGS_COLLECTION_ID,
      ID.unique(),
      {
        blog_markdown: blog,
        books: book_id,
        blog_image,
        user_id,
      }
    );
    console.log("Blog added successfully.");
    return document;
  } catch (error) {
    throw error;
  }
}

async function add_initiate_transaction_entry({
  amount,
  currency,
  expire_by,
  user_id,
  subscription_type,
  plink_id,
}: AddInitiateTransactionEntry): Promise<Models.Document> {
  try {
    const document = await databases.createDocument(
      DATABASE_ID,
      INITIATED_TRANSACTIONS_COLLECTION_ID,
      plink_id,
      {
        amount,
        currency,
        expire_by,
        user_id,
        subscription_type,
        plink_id,
      }
    );
    return document;
  } catch (error) {
    throw error;
  }
}

async function add_subscriptions_entry({
  payment_id,
  user_id,
  subscription_type,
  start_date,
  end_date,
  payment_method,
  amount,
  currency,
}: AddSubscriptionEntry): Promise<Models.Document> {
  try {
    const document = await databases.createDocument(
      DATABASE_ID,
      SUBSCRIPTIONS_COLLECTION_ID,
      ID.unique(),
      {
        amount,
        currency,
        payment_id,
        user_id,
        subscription_type,
        start_date,
        end_date,
        payment_method,
      }
    );
    return document;
  } catch (error) {
    throw error;
  }
}

async function add_subscription_quota({
  subscription_id,
  subscription_type,
}: AddSubscriptionQuota): Promise<Models.Document> {
  try {
    const document = await databases.createDocument(
      DATABASE_ID,
      SUBSCRIPTION_QUOTA_COLLECTION_ID,
      ID.unique(),
      {
        subscriptions: subscription_id,
        token_usage: 0,
        books_added: 0,
        blogs_generated: 0,
        allocated_blog_quota: subscription_type === "reader" ? 300 : 1000,
      }
    );
    return document;
  } catch (error) {
    throw error;
  }
}

async function add_feedback_entry({
  user_id,
  email,
  feedback,
  image_link,
}: AddFeedBackEntry): Promise<Models.Document> {
  try {
    const doc = await databases.createDocument(
      DATABASE_ID,
      PURPLE_FEEDBACKS_COLLECTION_ID,
      ID.unique(),
      {
        user_id,
        email,
        feedback,
        image_link,
      }
    );
    return doc;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  add_upload_book_entry,
  add_blogs,
  add_blog,
  add_deletion_entry,
  add_subscription_quota,
  add_initiate_transaction_entry,
  add_subscriptions_entry,
  add_feedback_entry,
};
