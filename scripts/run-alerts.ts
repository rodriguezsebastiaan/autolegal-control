import { evaluateAlerts } from "../src/lib/alerts";
import { db } from "../src/lib/db";

try {
  const result = await evaluateAlerts();
  console.log(JSON.stringify(result, null, 2));
} finally {
  await db.$disconnect();
}
