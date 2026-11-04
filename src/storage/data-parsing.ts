import type { EventTypes } from "@/network/events.js"
import { ulid } from "ulid"

interface DecodedData {
  id: string;
  eventType: string;
  topic: string;
  data: string;
  clientId: string;
}

const maxDataSize = 2 ** 32 //32 
const idLength = 32
const eventTypeLength = 20
const topicMaxLength = 20
export const sizeHeaderLength = String(maxDataSize).length


export function encodeMessage(id: string, eventType: EventTypes, clientId: string, topic: string, contents: string) {
  const totalLength = String(sizeHeaderLength + (idLength * 2) + eventTypeLength + topicMaxLength + contents.length);
  return `${totalLength.padEnd(sizeHeaderLength)}${id.padEnd(idLength)}${clientId.padEnd(idLength)}${eventType.padEnd(eventTypeLength)}${topic.padEnd(topicMaxLength)}${contents}`
}

export function parseData(rawData: string) {
  const minLength = sizeHeaderLength + eventTypeLength + topicMaxLength + idLength * 2 //16 is standard length for ulid
  if (rawData.length < minLength) {
    throw "Invalid data, expected minimum length is: " + minLength
  }

  const messageHeaderLimit = sizeHeaderLength;
  const idLimit = messageHeaderLimit + idLength
  const clientIdLimit = idLimit + idLength
  const eventTypeLimit = clientIdLimit + eventTypeLength
  const topicLimit = eventTypeLimit + topicMaxLength

  // const initialSize = rawData.slice(0, sizeHeaderLength)
  const id = rawData.slice(messageHeaderLimit, idLimit).trim()
  const clientId = rawData.slice(idLimit, clientIdLimit).trim()
  const eventType = rawData.slice(clientIdLimit, eventTypeLimit).trim()
  const topic = rawData.slice(eventTypeLimit, topicLimit).trim()
  const data = rawData.slice(eventTypeLimit + eventTypeLength).trim()

  return ({
    id, eventType, topic, data, clientId
  })
}

export function decodeMessage(rawData: string): Array<DecodedData> {
  const dataFrameLength = Number(rawData.slice(0, sizeHeaderLength))
  if (rawData.length == 0) {
    return []
  }

  const currentRawData = rawData.slice(0, dataFrameLength)
  const remainingRawData = rawData.slice(dataFrameLength)
  const data = parseData(currentRawData)
  return [
    data,
    ...decodeMessage(remainingRawData)
  ]

}