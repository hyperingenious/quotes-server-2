import { Request, Response, NextFunction } from "express";
import {
  databases,
  DATABASE_ID,
  SUBSCRIPTION_QUOTA_COLLECTION_ID,
  SUBSCRIPTIONS_COLLECTION_ID,
} from "../appwrite/appwrite";
import sdk from "node-appwrite";

async function invalidateSubscription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // @ts-ignore
  const user_id = req.verifiedToken.sub;
  try {
    const { documents } = await databases.listDocuments(
      DATABASE_ID,
      SUBSCRIPTIONS_COLLECTION_ID,
      [sdk.Query.equal("user_id", user_id)]
    );

    const currentDate = Math.floor(new Date().getTime() / 1000);

    /**
     * Checking if the subscription's ending date is not ended
     */
    for (let i = 0; i < documents.length; ++i) {
      /**
       * if ending date is not ended
       */
      if (documents[i].end_date > currentDate) {
        try {
          /**
           * Getting the usage quota for the subscription
           */
          const {
            documents: [subscriptionQuota],
          } = await databases.listDocuments(
            DATABASE_ID,
            SUBSCRIPTION_QUOTA_COLLECTION_ID,
            [sdk.Query.equal("subscriptions", documents[i].$id)]
          );

          /**
           * If generated blogs doesn't exceeds allocated quota, executes further
           */
          if (
            subscriptionQuota.allocated_blog_quota >
            subscriptionQuota.blogs_generated
          ) {
            // @ts-ignore
            req.remainingQuota =
              subscriptionQuota.allocated_blog_quota -
              subscriptionQuota.blogs_generated;
            // @ts-ignore
            req.subscriptionQuota = subscriptionQuota;
            // @ts-ignore
            req.subscription_type = documents[i].subscription_type;
            // @ts-ignore
            req.subscription = "reader";
            next();
            return;
          }
          /**
           * If generated blogs exceeded allocated quota.
           */
          if (
            subscriptionQuota.allocated_blog_quota <
            subscriptionQuota.blogs_generated
          ) {
            // @ts-ignore
            req.subscription = "unpaid";
            next();
            return;
          }
        } catch (quotaError) {
          console.error("Error fetching subscription quota:", quotaError);
          return res
            .status(500)
            .json({ error: "Internal Server Error fetching quota" });
        }
        break;
      }
    }
    // @ts-ignore
    req.subscription = "unpaid";
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export default invalidateSubscription;
