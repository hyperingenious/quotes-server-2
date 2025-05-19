import { Query, ID } from "node-appwrite";
import {
  databases,
  DATABASE_ID,
  CATEGORY_COLLECTION_ID,
} from "../appwrite/appwrite";
import { Request, Response, NextFunction } from "express";

async function createPublicCategory(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // @ts-ignore
  const verifiedToken = req.verifiedToken;
  try {
    const { total } = await databases.listDocuments(
      DATABASE_ID,
      CATEGORY_COLLECTION_ID,
      [
        Query.equal("user_id", verifiedToken.sub),
        Query.equal("category_name", "public"),
      ]
    );

    if (total === 0) {
      await databases.createDocument(
        DATABASE_ID,
        CATEGORY_COLLECTION_ID,
        ID.unique(),
        {
          user_id: verifiedToken.sub,
          category_name: "public",
        }
      );
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error, message: "Internal Server error" });
  }
}

export default createPublicCategory;
