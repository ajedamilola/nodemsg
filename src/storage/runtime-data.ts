export interface Message {
  topic: string,
  id: string,
  senderId: string,
  contents: string
}
//Actual runtime store of topics
const topics: { [key: string]: Message[] } = {}

export function insertRuntimeMessage(newMessage: Message) {
  const { topic } = newMessage
  if (topics[topic]) {
    topics[topic].unshift(newMessage)
    return newMessage
  }
  topics[topic] = [newMessage]
  return newMessage
}
