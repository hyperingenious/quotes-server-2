interface GetFreeContentCount {
  type: string;
  user_id: string;
}
interface GetBookDocumentById {
  bookId: string;
  user_id: string;
}
interface GetAllBooks {
  token: string;
}
interface GetAllUserSubscription {
  user_id: string;
}
interface GetAllUserInitiatedTransations {
  user_id: string;
}
interface GetImagesWithKeywordsMatch{
    keywords_array: string;
}
export {
  GetFreeContentCount,
  GetBookDocumentById,
  GetAllBooks,
  GetAllUserSubscription,
  GetAllUserInitiatedTransations,
  GetImagesWithKeywordsMatch
};
