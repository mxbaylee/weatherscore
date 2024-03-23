import { spawn } from 'child_process'

export function pbcopy (data) {
  const proc = spawn('pbcopy')
  proc.stdin.write(String(data))
  proc.stdin.end()
}
