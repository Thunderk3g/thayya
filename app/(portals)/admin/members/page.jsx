import { listMembers } from "../../../../lib/db";
import MembersClient from "./MembersClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Members — Thayya™" };

export default async function AdminMembersPage() {
  const initialMembers = await listMembers();
  return <MembersClient initialMembers={initialMembers} />;
}
