import { random_chunk } from "./chunk_random";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { get_chunk_by_id } from "../appwrite/get/get_appwrite";

async function createFileFromRandomChunksGenerateContent(
  chunkIds: string[]
): Promise<string> {
  const random_20_percent_chunkids = random_chunk(chunkIds);
  let random_20_percent_chunk_text = ``;
  const divider = "========================================================";

  for (const chunkId of random_20_percent_chunkids) {
    try {
      const chunk = await get_chunk_by_id(chunkId);
      random_20_percent_chunk_text += `${divider}\n${chunk.chunk_text}\n`;
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Error retrieving chunk with ID ${chunkId}: ${error.message}`
        );
      } else {
        console.error(`Error retrieving chunk with ID ${chunkId}:`, error);
      }
    }
  }

  const fileName = `${crypto.randomUUID()}.txt`;
  const filePath = path.resolve(fileName);
  await fs.writeFile(fileName, random_20_percent_chunk_text);

  return filePath;
}

async function createFileFromRandomChunks(chunked_text: string[]) {
  const random_chunks = random_chunk(chunked_text);
  let random_text = ``;
  const divider = "========================================================";

  for (const chunk of random_chunks) {
    random_text += `${divider}\n${chunk}\n`;
  }

  const fileName = `${crypto.randomUUID()}.txt`;
  const filePath = path.resolve(fileName);
  await fs.writeFile(filePath, random_text, "utf-8");

  return filePath;
}
export {
  createFileFromRandomChunksGenerateContent,
  createFileFromRandomChunks,
};
