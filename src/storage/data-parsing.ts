import type { EventTypes } from "@/network/events.js"
import { ulid } from "ulid"

const idLength = 32
const eventTypeLength = 20
const topicMaxLength = 20


export function encodeMessage(id: string, eventType: EventTypes, clientId: string, topic: string, contents: string) {
  return `${id.padEnd(idLength)}${clientId.padEnd(idLength)}${eventType.padEnd(eventTypeLength)}${topic.padEnd(topicMaxLength)}${contents}`
}

export function decodeMessage(rawData: string) {
  const minLength = eventTypeLength + topicMaxLength + idLength //16 is standard length for ulid
  if (rawData.length < minLength) {
    throw "Invalid data, expected minimum length is: " + minLength
  }

  const clientIdLimit = idLength * 2
  const eventTypeLimit = eventTypeLength + clientIdLimit
  const topicLimit = eventTypeLength + (idLength * 2) + topicMaxLength

  const id = rawData.slice(0, idLength).trim()
  const clientId = rawData.slice(idLength, clientIdLimit).trim()
  const eventType = rawData.slice(clientIdLimit, eventTypeLimit).trim()
  const topic = rawData.slice(eventTypeLimit, topicLimit).trim()
  const data = rawData.slice(eventTypeLimit + eventTypeLength).trim()

  return ({
    id, eventType, topic, data, clientId
  })
}