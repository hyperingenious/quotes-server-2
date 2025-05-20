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
): Promise<void> {
  // @ts-ignore
  const user_id = req.verifiedToken?.sub;

  if (!user_id) {
    res.status(401).json({ error: "Unauthorized: Missing user ID" });
    return;
  }

  try {
    const { documents: subscriptions } = await databases.listDocuments(
      DATABASE_ID,
      SUBSCRIPTIONS_COLLECTION_ID,
      [sdk.Query.equal("user_id", user_id)]
    );

    const currentDate = Math.floor(Date.now() / 1000);
    let validSubscriptionFound = false;

    for (const subscription of subscriptions) {
      if (subscription.end_date > currentDate) {
        validSubscriptionFound = true;

        try {
          const { documents: quotas } = await databases.listDocuments(
            DATABASE_ID,
            SUBSCRIPTION_QUOTA_COLLECTION_ID,
            [sdk.Query.equal("subscriptions", subscription.$id)]
          );

          const subscriptionQuota = quotas?.[0];

          if (!subscriptionQuota) {
            console.warn("No subscription quota found for this subscription.");
            break;
          }

          const remainingQuota =
            subscriptionQuota.allocated_blog_quota -
            subscriptionQuota.blogs_generated;

          // @ts-ignore
          req.remainingQuota = remainingQuota;
          // @ts-ignore
          req.subscriptionQuota = subscriptionQuota;
          // @ts-ignore
          req.subscription_type = subscription.subscription_type;

          // @ts-ignore
          req.subscription =
            remainingQuota > 0 ? "reader" : "unpaid";

          next();
          return;
        } catch (quotaError) {
          console.error("Error fetching subscription quota:", quotaError);
          res
            .status(500)
            .json({ error: "Internal Server Error fetching quota" });
          return;
        }
      }
    }

    // If no valid subscription found
    if (!validSubscriptionFound) {
      // @ts-ignore
      req.subscription = "unpaid";
    }

    next();
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export default invalidateSubscription;