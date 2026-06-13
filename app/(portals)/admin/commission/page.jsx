import { getCommissionConfig, listPayouts } from "../../../../lib/db";
import CommissionClient from "./CommissionClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Commission — Thayya™" };

export default async function AdminCommissionPage() {
  const [config, payouts] = await Promise.all([getCommissionConfig(), listPayouts()]);
  return <CommissionClient initialConfig={config} initialPayouts={payouts} />;
}
