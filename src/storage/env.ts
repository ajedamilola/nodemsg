import 'dotenv/config';
import { Command, InvalidArgumentError } from 'commander';
import { die } from '@/cli/utils.js';

const DEFAULT_PORT = Number(process.env.PORT) || 8555;

function parseIntArg(name: string, min = 0) {
  return (value: string): number => {
    const n = Number(value);
    if (!Number.isInteger(n) || n < min) {
      die(`${name} must be an integer >= ${min}`);
    }
    return n;
  };
}

const parsePort = (value: string): number => {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 65535) {
    die("port must be between 1 and 65535")
  }
  return n;
};

const program = new Command();
program.name('Nodemsg').description('Very Simple Message broker CLI').version('1.0.0');

program
  .command('start-server')
  .description('start the server')
  .option('-p, --port <port>', 'port to listen on', parsePort, DEFAULT_PORT)

program
  .command('get-messages')
  .description('get messages from a topic')
  .option('-p, --port <port>', 'server port', parsePort, DEFAULT_PORT)
  .requiredOption('-t, --topic <topic>', 'topic to read from')
  .option('--offset <n>', 'messages to skip', parseIntArg('offset', 1), 1)
  .option('--limit <n>', 'max messages to return', parseIntArg('limit', 1), 20)
  .option("--listen", "Listen for messages on a subscribed topic", false)

program
  .command('send-message')
  .description('send a message to a topic')
  .option('-p, --port <port>', 'server port', parsePort, DEFAULT_PORT)
  .requiredOption('-t, --topic <topic>', 'topic to publish to')
  .requiredOption('-c, --content <content>', 'message content')
  .option("--listen", "Listen for messages on a subscribed topic", false)

program.command("get-status")
  .option('-p, --port <port>', 'server port', parsePort, DEFAULT_PORT)

program.parse();
const currentCommand = program.args[0] as "start-server" | "get-messages" | "send-message" | "get-status"
const opts = program.commands.find(c => c.name() === currentCommand)!.opts()

export const port = opts.port as number
export const topic = opts.topic as string | undefined
export const content = opts.content as string | undefined
export const offset = opts.offser as string | undefined
export const limit = opts.limit as string | undefined
export const listen = opts.listen as boolean

export { currentCommand as command }