export function die(...errmsg: string[]) {
  console.error(errmsg)
  process.kill(1)
}