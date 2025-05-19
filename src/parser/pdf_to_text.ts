import fs from "fs";
import mammoth from "mammoth";
import pdf from "pdf-parse";
import { parseEpub } from '@gxl/epub-parser';
import htmlToText from "html-to-text";

// Type for EPUB section (from @gxl/epub-parser)
interface EpubSection {
  htmlString: string;
  [key: string]: any;
}

// Type for EPUB object returned by parseEpub
interface EpubObject {
  sections?: EpubSection[];
  [key: string]: any;
}

// Type for PDF-Parse result
interface PdfParseResult {
  text: string;
  [key: string]: any;
}

const parseEPUB = async (filepath: string): Promise<string> => {
  const epubObj: EpubObject = await parseEpub(filepath, { type: "path" });

  // Get all EPUB text content
  const chapters: EpubSection[] = epubObj.sections || [];

  const extractedText: string = chapters
    .map((ch) => htmlToText.convert(ch.htmlString))
    .join("\n\n");

  return extractedText;
};

const parsePDF = async (filepath: string): Promise<string> => {
  try {
    const dataBuffer: Buffer = fs.readFileSync(filepath);
    return pdf(dataBuffer).then((data: PdfParseResult) => data.text);
  } catch (error) {
    console.error("Problem in parsing PDF");
    throw error;
  }
};

async function parseDOC(filepath: string): Promise<string> {
  const buffer: Buffer = fs.readFileSync(filepath);
  const { value: text }: { value: string } = await mammoth.extractRawText({ buffer });
  return text;
}

async function parseTXT(filepath: string): Promise<string> {
  const text: string = fs.readFileSync(filepath, "utf8");
  console.log(text);
  return text;
}

export {
  parsePDF,
  parseDOC,
  parseEPUB,
  parseTXT
};