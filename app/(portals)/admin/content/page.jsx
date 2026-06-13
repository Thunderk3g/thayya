import { listContentDrops } from "../../../../lib/db";
import ContentClient from "./ContentClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Content Drops — Thayya™" };

export default async function AdminContentPage() {
  const initialDrops = await listContentDrops();
  return <ContentClient initialDrops={initialDrops} />;
}
