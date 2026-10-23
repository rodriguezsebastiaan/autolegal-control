import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const port = process.env.AUTOLEGAL_DEMO_PORT || "3000";
const portNumber = Number(port);
if (!Number.isInteger(portNumber) || portNumber < 1 || portNumber > 65_535) throw new Error("AUTOLEGAL_DEMO_PORT debe ser un puerto numérico válido.");

const nextCli = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const child = spawn(process.execPath, [nextCli, "dev", "demo-app", "--webpack", "--hostname", "127.0.0.1", "--port", port], {
  cwd: fileURLToPath(new URL("..", import.meta.url)),
  env: { ...process.env, NODE_ENV: "development", AUTOLEGAL_LOCAL_DEMO: "enabled" },
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
child.on("error", (error) => {
  console.error("No fue posible iniciar el panel local de AUTOLEGAL CONTROL:", error);
  process.exit(1);
});
