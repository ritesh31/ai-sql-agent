import { db } from "../../../db/db";
import { conversationsTable } from "../../../db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const conversations = await db
    .select({
      id: conversationsTable.id,
      title: conversationsTable.title,
      updatedAt: conversationsTable.updatedAt,
    })
    .from(conversationsTable)
    .orderBy(desc(conversationsTable.updatedAt));

  return Response.json(conversations);
}
