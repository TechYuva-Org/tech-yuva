import "dotenv/config";
import { db } from "./src/db/index.js";
import { founderContent } from "./src/db/schema.js";
import { eq } from "drizzle-orm";

async function main() {
  try {
    await db.update(founderContent)
      .set({ photo: "/founder-photo.jpg" })
      .where(eq(founderContent.id, "global"));
    console.log("Updated founder photo to /founder-photo.jpg successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Failed to update photo:", err);
    process.exit(1);
  }
}

main();
