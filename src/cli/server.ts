import TCP from "@/network/tcp.js";
import { port, topic, limit, offset } from "@/storage/env.js";
import { die } from "./utils.js";
import { EventTypes } from "@/network/events.js";
import type { Socket } from "node:net";
import { decodeMessage, sizeHeaderLength } from "@/storage/data-parsing.js";
import { ulid } from "ulid";
import { getRuntimeMessages, insertRuntimeMessage, type Message } from "@/storage/runtime-data.js";
import { addListener, broadCastMessages, clientMap, listeners, removeListener, sendMessages } from "@/network/channel.js";

async function handleServer() {
  await TCP.startServer(port, (socket: Socket) => {
    socket.on("data", (buffer) => {
      const rawData = buffer.toString()
      const decodedDatas = decodeMessage(rawData)

      for (const data of decodedDatas) {
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
          case EventTypes.GET_MESSAGES:
            const paginationParams = JSON.parse(data.data)
            const fetchedMessages = getRuntimeMessages(data.topic, {
              limit: paginationParams.limit,
              offset: paginationParams.offset
            })
            sendMessages(fetchedMessages, [socket])

            break
          default:
            die("Invalid Event type", data.eventType)
        }
      }

    })

    socket.on("end", () => {
      const address = `${socket.remoteAddress}${socket.remotePort}`
      const subscribedTopic = clientMap[address];
      if (subscribedTopic) {
        removeListener(subscribedTopic, address)
      }
    })
  })
}

export default handleServer