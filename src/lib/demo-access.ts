import { notFound } from "next/navigation";

export const LOCAL_DEMO_FLAG = "enabled";

export function isLocalDemoEnabled(input: { nodeEnv?: string; flag?: string }) {
  return input.nodeEnv === "development" && input.flag === LOCAL_DEMO_FLAG;
}

export function requireLocalDemo() {
  if (!isLocalDemoEnabled({ nodeEnv: process.env.NODE_ENV, flag: process.env.AUTOLEGAL_LOCAL_DEMO })) notFound();
}
