import fs from "fs";
import path from "path";

export function loadMasterPrompt() {
  const filePath = path.join(process.cwd(), "docs", "MASTER_PROMPT.md");
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    console.warn("Unable to load MASTER_PROMPT.md", error);
    return "";
  }
}
