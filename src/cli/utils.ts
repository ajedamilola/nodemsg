import { verbose } from "@/cli/entrypoint.js"

export function die(...errmsg: any[]) {
  console.error(errmsg.join(" "))
  process.kill(1)
}

/**
 * For Debugging purposes
 */
export function silentLog(...content: any[]) {
  if (verbose) {
    console.log(content.join(" "))
  }
}