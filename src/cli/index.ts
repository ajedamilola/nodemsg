#!/usr/bin/env node

import TCP from "@/network/tcp.js";
import { command, port, content, topic, listen } from "@/storage/env.js";
import { die } from "./utils.js";
import { EventTypes } from "@/network/events.js";
import type { Socket } from "node:net";
import { decodeMessage, encodeMessage } from "@/storage/data-parsing.js";
import { ulid } from "ulid";
import { insertRuntimeMessage, type Message } from "@/storage/runtime-data.js";
import { addListener, broadCastMessages, clientMap, listeners, removeListener, sendMessages } from "@/network/channel.js";

/* -------------------------------------------------------------------------- */
/*                            Main App entry point                            */
/* -------------------------------------------------------------------------- */
async function start() {
  /* -------------------- Server Mode (Running as a server) ------------------- */
  if (command == "start-server") {
    await TCP.startServer(port, (socket: Socket) => {
      socket.on("data", (buffer) => {
        const data = decodeMessage(buffer.toString())
        switch (data.eventType) {
          case EventTypes.SEND_MESSAGE:
            const newMessage = insertRuntimeMessage({
              contents: data.data,
              id: data.id,
              senderId: data.clientId,
              topic: data.topic
            })
            broadCastMessages(newMessage, data.topic)
            break;
          case EventTypes.START_LISTENING:
            addListener(data.topic, socket, data.clientId)
            break
          case EventTypes.GET_SERVER_STATUS:
            const statusMessage: Message = {
              contents: JSON.stringify({ listeners, clientMap }),
              id: ulid(),
              senderId: "",
              topic: "server"
            }
            sendMessages(statusMessage, [socket])
            break
          default:
            die("Invalid Event type", data.eventType)
        }
      })

      socket.on("end", () => {
        const address = `${socket.remoteAddress}${socket.remotePort}`
        const subscribedTopic = clientMap[address];
        if (subscribedTopic) {
          removeListener(subscribedTopic, address)
        }
      })
      console.log({ listeners: JSON.stringify(listeners), clientMap })
    })
  }

  /* ----- Client Mode (This mode allows you to send and recieve messages) ---- */
  if (command == "send-message" || command == "get-messages" || command == "get-status") {
    const client = TCP.startClient(port)
    const clientId = ulid(client.localPort)
    console.log("[LOG]", `Started client with id ${clientId}`)

    if (command == "send-message") {
      const data = encodeMessage(ulid(), EventTypes.SEND_MESSAGE, clientId, topic || "", content || "")
      client.write(data)
    }

    if (command == "get-status") {
      client.write(encodeMessage(
        ulid(),
        EventTypes.GET_SERVER_STATUS,
        clientId,
        "",
        ""
      ))
      client.on("data", (rawData) => {
        console.log("[RECIEVED DATA]", decodeMessage(rawData.toString()))
        client.end()
      })
    }

    if (listen) {
      client.write(encodeMessage(
        ulid(),
        EventTypes.START_LISTENING,
        clientId,
        topic as string,
        ""
      ))
      console.log("[LOG]", `Client ${clientId} is ready to recieve message broadcasts`)
      client.on("data", (rawData) => {
        const response = decodeMessage(rawData.toString())
        console.log("[RECIEVED DATA]", response)
      })
    }

    if (!listen && command != "get-status") {
      client.end()
    }
  }
}

start()