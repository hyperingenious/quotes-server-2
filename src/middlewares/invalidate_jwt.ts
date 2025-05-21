import { invalidateToken } from "../helpers/helper";
import { Request, Response, NextFunction } from "express";

async function invalidateJwt(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const verifiedToken = await invalidateToken( req, res ,next);
    // @ts-ignore
    req.verifiedToken = verifiedToken;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ error: "Unauthorized", message: "Cannot authenticate you" });
  }
}

export default invalidateJwt;
