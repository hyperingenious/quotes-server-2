interface DeleteBookEntryById {
  bookId: string;
}

interface MakeAllDeletionEntries {
  documentId: string;
  file_id: string;
}

interface DeleteBookEntryByIdAndToken {
  token: string;
  documentId: string;
}

interface DeleteBlogEntryByIdAndToken {
  token: string;
  documentId: string;
}
interface DeleteEverything{
    token:string;
}


export {
  DeleteBookEntryById,
  MakeAllDeletionEntries,
  DeleteBookEntryByIdAndToken,
  DeleteBlogEntryByIdAndToken,
DeleteEverything
};
