import { get_all_books } from "../../appwrite/get/get_appwrite";
import { list_all_blogs } from "../../appwrite/list/list_appwrite";
import { Request, Response } from "express";

async function get_content(req: Request, res: Response) {
  try {
    const token = req.body.token;
    const preference = req.body.preference;
    console.log(req.body);

    if (!token) res.status(400).json({ message: "No token found" });

    switch (preference.preferenceType) {
      /* Lists all books using the token */
      case "list_books":
        const books = await get_all_books({ token });
        res.status(200).json(books);

      /* List all the blogs with associated token and book_id */
      case "list_blogs":
        const blogs = await list_all_blogs({
          token,
          book_id: preference.book_id,
        });
        res.status(200).json(blogs);

      default:
        res.status(400).json({ message: "unrecognized parameters" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error });
  }
}
export  { get_content };
