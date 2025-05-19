import { verify_token } from "../../appwrite/verify/verify_appwrite";
import { Request, Response } from "express";

async function verifyToken(req: Request, res: Response) {
  const token = req.body.token;
  console.log(token);

  if (!token) {
    return res.status(400).json({ error: "No token found" });
  }

  try {
    // Call the imported function to verify the token
    const { isTokenValid, related_data } = await verify_token({ token });
    // Respond with the result of the verification
    return res.status(200).json({ isTokenValid, related_data });
  } catch (error) {
    // Handle any errors during token verification
    console.error("Error verifying token:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export { verifyToken };
