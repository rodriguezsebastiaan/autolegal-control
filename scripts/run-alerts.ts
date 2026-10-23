import { evaluateAlerts } from "../src/lib/alerts";
import { db } from "../src/lib/db";

try {
  const result = await evaluateAlerts();
  console.log(JSON.stringify(result, null, 2));
  if (result.status === "FAILED" || result.status === "PARTIAL") process.exitCode = 1;
} finally {
  await db.$disconnect();
}
