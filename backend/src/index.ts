import app from "./app";
import { logger } from "./lib/logger";

/** Em dev local o Vite faz proxy para esta porta (vite.config → 3000). */
const rawPort = process.env["PORT"]?.trim() || "3000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, () => {
  logger.info({ port }, "Server listening");
});
