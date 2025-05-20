import { config } from "dotenv";
config();

import {
  databases,
  DATABASE_ID,
  SUBSCRIPTIONS_COLLECTION_ID,
  SUBSCRIPTION_QUOTA_COLLECTION_ID,
  FREE_CONTENT_GENERATION_ENTRIES,
} from "../appwrite/appwrite";
import sdk, { Models } from "node-appwrite";
import { invalidateToken } from "../helpers/helper";

import { NextFunction, Request, Response } from "express";
async function getSubscription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const verifiedToken = await invalidateToken(req, res, next);
    // @ts-ignore
    const { documents } = await databases.listDocuments(
      DATABASE_ID,
      SUBSCRIPTIONS_COLLECTION_ID,
      // @ts-ignore
      [sdk.Query.equal("user_id", verifiedToken.sub)]
    );

    let subscription = { isActiveSubscription: false };
    const currentDate = Math.floor(new Date().getTime() / 1000);

    for (let i = 0; i < documents.length; ++i) {
      if (documents[i].end_date > currentDate) {
        try {
          const {
            documents: [subscriptionQuota],
          } = await databases.listDocuments(
            DATABASE_ID,
            SUBSCRIPTION_QUOTA_COLLECTION_ID,
            [sdk.Query.equal("subscriptions", documents[i].$id)]
          );

          subscription = {
            ...subscription,
            ...documents[i],
            isActiveSubscription: true,
          };
          (subscription as any).quota = subscriptionQuota;
        } catch (quotaError) {
          console.error("Error fetching subscription quota:", quotaError);
          res
            .status(500)
            .json({ error: "Internal Server Error fetching quota" });
          return;
        }
        break; // Exit loop after finding an active subscription
      }
    }

    const { total: freeBlogCount } = await databases.listDocuments(
      DATABASE_ID,
      FREE_CONTENT_GENERATION_ENTRIES,
      [
        // @ts-ignore
        sdk.Query.equal("user_id", verifiedToken.sub),
        sdk.Query.equal("type", "blog"),
        sdk.Query.select(["$id"]),
      ]
    );
    const { total: freeBookCount } = await databases.listDocuments(
      DATABASE_ID,
      FREE_CONTENT_GENERATION_ENTRIES,
      [
        // @ts-ignore
        sdk.Query.equal("user_id", verifiedToken.sub),
        sdk.Query.equal("type", "book"),
        sdk.Query.select(["$id"]),
      ]
    );

    // @ts-ignore
    subscription.freeBlogCount = freeBlogCount;

    // @ts-ignore
    subscription.freeBookCount = freeBookCount;

    res.status(200).json(subscription);
    return;
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error fetching subscriptions" });
    return;
  }
}

export { getSubscription };
