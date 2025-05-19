interface AddDeletionEntry {
  file_id: string | null;
  chunk_id_array: string[];
  blog_id_array: string[];
}

interface AddBlog {
  blog: string;
  book_id: string;
  user_id: string;
  blog_image: string;
}

interface AddInitiateTransactionEntry {
  amount: number;
  currency: string;
  expire_by: number;
  user_id: string;
  subscription_type: string;
  plink_id: string;
}

interface AddSubscriptionEntry {
  payment_id: string;
  user_id: string;
  subscription_type: string;
  start_date: number;
  end_date: number;
  payment_method: string;
  amount: number;
  currency: string;
}

interface AddSubscriptionQuota {
  subscription_id: string;
  subscription_type: string;
}

interface AddFeedBackEntry {
  user_id: string;
  email: string;
  feedback: string;
  image_link?: string;
}

export {
  AddDeletionEntry,
  AddBlog,
  AddInitiateTransactionEntry,
  AddSubscriptionEntry,
  AddSubscriptionQuota,
  AddFeedBackEntry,
};
