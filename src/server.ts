import { config } from "dotenv";
config();
import express, { Request, Response } from "express";
import cors from "cors";
import axios from "axios";

import { startup } from "./startup/startup";
import { cronjob } from "./cron/cronjob";

import { generateContent } from "./routes/generate_content";
import { deleteContent } from "./routes/delete_content";
import feedback from "./routes/feedback";
import { getSubscription } from "./routes/get_subscription";
import tokenPlan from "./routes/get_token_plan";

// Middlewares
import { userSubscriptionQuota } from "./middlewares/user_subscription_quota";
import invalidateJwt from "./middlewares/invalidate_jwt";
import saveFiles from "./middlewares/saveFiles";
import checkBlogCount from "./middlewares/checkBlogCount";
import invalidateSubscription from "./middlewares/invalidateSubscription";
import checkFileSize from "./middlewares/checkFileSize";
import checkFileMimetype from "./middlewares/checkFileMimetype";
import createPublicCategory from "./middlewares/createPublicCategory";

//CLI 
import { verifyToken } from "./routes/cli/verify_token";
import { dataDeletion } from "./routes/cli/data_deletion";
import { DataUpdate } from "./routes/cli/update_blogs";
import { get_content } from "./routes/cli/get_content";

import { clientAppwritePOST } from "./routes/client-appwrite/post";
import {
  clientAppwriteGET,
  publicClientAppwriteGET,
} from "./routes/client-appwrite/get";

import { initiateTransaction } from "./routes/razorpay/initiate_transaction";
import { razorpayWebhookEndpoint } from "./routes/razorpay/webhook-endbpoint";
import uploadPDFRouteNew from "./routes/upload_pdf_route_new";

const app = express();
const PORT = process.env.PORT || 3000;
const SELF_HOSTED_URL = process.env.SELF_HOSTED_URL || "";

// Ping the app every 10 minutes (10 * 60 * 1000 ms)
setInterval(() => {
  axios
    .get(SELF_HOSTED_URL)
    .then(() => console.log(`Self-pinged ${SELF_HOSTED_URL} successfully`))
    .catch((error) => console.error("Self-ping failed:", error.message));
}, 10 * 60 * 1000); // Adjust interval as needed

// Initialize application
startup();

// CORS configuration
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Runs from 12am to 6am
cronjob("*/10 0-5 * * *");

app.post(
  "/new-upload",
  invalidateJwt,
  createPublicCategory,
  invalidateSubscription,
  checkBlogCount,
  saveFiles,
  checkFileSize,
  checkFileMimetype,
  uploadPDFRouteNew
);
app.post("/generate-content", userSubscriptionQuota, generateContent);
app.post("/delete-content", deleteContent);
app.post("/feedback", feedback);

// CLI
app.post("/cli/verify-token", verifyToken);
app.post("/cli/delete", dataDeletion);
app.post("/cli/update-blogs", DataUpdate);
app.post("/cli/generate-content", generateContent);
app.post("/cli/get-content", get_content);

/* Appwrite Client POST & GET */
app.post("/client-appwrite-post", clientAppwritePOST);
app.get("/client-appwrite-get", clientAppwriteGET);
app.get("/public-client-appwrite-get", publicClientAppwriteGET);

/* Initiate Transaction*/
app.post("/initiate-transaction", initiateTransaction);
app.post("/razorpay-webhook-endpoint", razorpayWebhookEndpoint);

app.get("/get-subscription", getSubscription);
app.post("/get-token-plan", invalidateJwt, tokenPlan);

// Basic route
app.get("/", (_: Request, res: Response) => {
  res.send("<h1>Hello World</h1>");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
