import TCP from "@/network/tcp.js";
import { command, port, content, topic, listen, limit, offset, host } from "@/cli/entrypoint.js";
import { EventTypes } from "@/network/events.js";
import { decodeMessage, encodeMessage } from "@/storage/data-parsing.js";
import { ulid } from "ulid";
import type { Socket } from "node:net";


async function handleClient() {
  TCP.startClient(host, port, (client: Socket) => {
    // console.log({ client })
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
        console.log("[DATA]", decodeMessage(rawData.toString()))
        client.end()
      })
    }

    if (command == "get-messages" && topic) {
      const request = encodeMessage(ulid(), EventTypes.GET_MESSAGES, clientId, topic, JSON.stringify({ limit, offset }));
      client.write(request)

      if (!listen) {
        let recievedData = setTimeout(() => {
          //if nothing has been recieved after a while close the connection
          console.log("[WARN]", "Data Retrieval timeout, Closing Connection ")
          client.end()
        }, 5000)
        //only handle messages if listening is false. so as to avoid double handling since listening(bool) actually handles below
        client.on("data", (rawData) => {
          console.log("[DATA]", decodeMessage(rawData.toString()))
          clearTimeout(recievedData)
          client.end()
        })
      }
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
        console.log("[DATA]", response)
      })
    }

    if (!listen && command == "send-message") {
      client.end()
    }
  })
}

export default handleClient