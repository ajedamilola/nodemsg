export interface Message {
  topic: string,
  id: string,
  senderId: string,
  contents: string,
  timeStamp: string
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

interface PaginationOptions {
  limit: number | undefined
  offset: number | undefined
}

export function getRuntimeMessages(topic: string, paginator: PaginationOptions): Message[] {
  const messages = topics[topic];
  if (messages == null) {
    return []
  } else {
    const start = (paginator?.offset || 1) - 1;
    const end = start + (paginator.limit || 20)
    return messages.slice(start, end)
  }
}
