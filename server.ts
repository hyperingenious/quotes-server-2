import {config} from "dotenv";
config()
import express, {Request, Response} from "express";
import cors from "cors";
import  axios  from "axios";

import { startup } from "./src/startup/startup";
import { cronjob } from "./src/cron/cronjob";

import { upload_pdf_route } from "./src/routes/upload";
import { generateContent } from "./src/routes/generate_content";
import { deleteContent } from "./src/routes/delete_content";
import feedback from "./src/routes/feedback";
import { getSubscription } from "./src/routes/get_subscription";
import tokenPlan from "./src/routes/get_token_plan";

import { userSubscriptionQuota } from "./src/middlewares/user_subscription_quota";
import invalidateJwt from "./src/middlewares/invalidate_jwt";
import saveFiles from './middlewares/saveFiles'

import { verifyToken } from "./src/routes/cli/verify_token";
import { dataDeletion } from "./src/routes/cli/data_deletion";
import { DataUpdate } from "./src/routes/cli/update_blogs";
import { get_content } from "./src/routes/cli/get_content";

import { clientAppwritePOST } from "./src/routes/client-appwrite/post";
import { clientAppwriteGET, publicClientAppwriteGET } from "./src/routes/client-appwrite/get";

import { initiateTransaction } from "./src/routes/razorpay/intiate_transaction";
import { razorpayWebhookEndpoint } from "./src/routes/razorpay/webhook-endpoint";
import { invalidateToken } from "./src/helpers/helper";
import checkBlogCount from "./src/middlewares/checkBlogCount";
import invalidateSubscription from "./src/middlewares/invalidateSubscription";
import checkFileSize from "./src/middlewares/checkFileSize";
import checkFileMimetype from "./src/middlewares/checkFileMimetype";
import uploadPDFRouteNew from "./src/routes/upload_pdf_route_new";
import createPublicCategory from "./src/middlewares/createPublicCategory";

const app = express();
const PORT = process.env.PORT || 3000;
const SELF_HOSTED_URL = process.env.SELF_HOSTED_URL;

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
    origin: '*',
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json());

// Runs from 12am to 6am
cronjob("*/10 0-5 * * *")

// Route definitions
app.post("/upload", invalidateToken, userSubscriptionQuota, upload_pdf_route);


app.post('/new-upload', invalidateJwt, createPublicCategory, invalidateSubscription, checkBlogCount, saveFiles, checkFileSize, checkFileMimetype, uploadPDFRouteNew)
app.post("/generate-content", userSubscriptionQuota, generateContent);
app.post("/delete-content", deleteContent);
app.post("/feedback", feedback);

// CLI
app.post("/cli/verify-token", verifyToken);
app.post("/cli/delete", dataDeletion);
app.post("/cli/update-blogs", DataUpdate);
app.post("/cli/generate-content", generateContent)
app.post("/cli/get-content", get_content)

/* Appwrite Client POST & GET */
app.post("/client-appwrite-post", clientAppwritePOST)
app.get("/client-appwrite-get", clientAppwriteGET)
app.get("/public-client-appwrite-get", publicClientAppwriteGET)

/* Initiate Transaction*/
app.post('/initiate-transaction', initiateTransaction);
app.post('/razorpay-webhook-endpoint', razorpayWebhookEndpoint);

app.get('/get-subscription', getSubscription);
app.post('/get-token-plan', invalidateJwt, tokenPlan)

// Basic route
app.get("/", (_:Request    , res : Response) => {
  res.send("<h1>Hello World</h1>");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});