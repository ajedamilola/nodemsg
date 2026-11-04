import { encodeMessage } from "@/storage/data-parsing.js"
import type { Message } from "@/storage/runtime-data.js"
import type { Socket } from "node:net"
import { EventTypes } from "./events.js"
import { ulid } from "ulid"


/** 
 * A mapping that uses the topic as key and the clients sockets as values. effectively all of the listeners to that topic
 * can be easily gotten via indexing the topic
*/
export const listeners: { [topic: string]: Array<{ socket: Socket, id: string }> } = {}

/**
 * On event of a crash from the client's side the server event listener doesnt know anything about topic id so to clean things up,
 * we use the address to find the listener from the topic it belongs to making it much much faster than going through
 * all of the available topics in the lisiteners above
 */
export const clientMap: { [address: string]: string } = {}

export const addListener = (topic: string, socket: Socket, id: string) => {
  if (!listeners[topic]) {
    listeners[topic] = []
  }
  listeners[topic].push({ socket, id })

  //Add the adding the easy client map
  clientMap[`${socket.remoteAddress}${socket.remotePort}`] = topic
}

export const removeListener = (topic: string, clientAddress: string) => {
  listeners[topic] = listeners[topic]!.filter(listener => {
    const address = `${listener.socket.remoteAddress}${listener.socket.remotePort}`
    return address != clientAddress
  })
  delete clientMap[clientAddress]
}

export const broadCastMessages = (messages: Message[] | Message, topic: string) => {
  const clients = listeners[topic]
  if (!clients) return

  for (const client of clients) {
    if (Array.isArray(messages)) {
      messages.forEach(message => {
        /* ---- only send for other clients excluding the sender to prevent echo ---- */
        if (client.id != message.senderId) {
          client.socket.write(encodeMessage(message.id,
            EventTypes.RECIEVE_BROADCAST,
            message.senderId,
            message.topic,
            message.contents
          ))
        }

      })
    } else {
      const message = messages
      if (client.id != message.senderId) {
        client.socket.write(encodeMessage(message.id,
          EventTypes.RECIEVE_BROADCAST,
          message.senderId,
          message.topic,
          message.contents
        ))
      }
    }

  }
}

export const sendMessages = (messages: Message[] | Message, clients: Socket[]) => {
  for (const client of clients) {
    if (Array.isArray(messages)) {
      console.log("Message is an array", messages)
      messages.forEach(message => {
        client.write(encodeMessage(message.id,
          EventTypes.RECIEVE_BROADCAST,
          message.senderId,
          message.topic,
          message.contents
        ))
      })

    } else {
      const message = messages;
      client.write(encodeMessage(message.id,
        EventTypes.RECIEVE_BROADCAST,
        message.senderId,
        message.topic,
        message.contents
      ))
    }

  }
}