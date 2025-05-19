import { verify_token } from "../../appwrite/verify/verify_appwrite";
import { Request, Response } from "express";
async function generateContent(req: Request, res: Response) {
  const token = req.body.token;

  if (!token) {
    return res.status(400).json({ error: "No token found" });
  }

  try {
    // Call the imported function to verify the token
    const isTokenValid = await verify_token({ token });
    if (!isTokenValid) {
      return res.status(400).json({ message: "Invalid or missing token" });
    }

    res.redirect("/upload");
  } catch (error) {
    // Handle any errors during token verification
    console.error("Error verifying token:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export { generateContent };
