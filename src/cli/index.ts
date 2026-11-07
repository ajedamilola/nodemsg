#!/usr/bin/env node

import { command } from "@/cli/entrypoint.js";
import handleClient from "./client.js";
import handleServer from "./server.js";

/* -------------------------------------------------------------------------- */
/*                            Main App entry point                            */
/* -------------------------------------------------------------------------- */
async function start() {
  /* -------------------- Server Mode (Running as a server) ------------------- */
  if (command == "start-server") {
    handleServer()
  }

  /* ----- Client Mode (This mode allows you to send and recieve messages) ---- */
  const clientCommands = ["send-message", "get-messages", "get-status"]
  if (clientCommands.includes(command)) {
    handleClient()
  }
}

start()