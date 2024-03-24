import { spawn } from 'child_process'

export function pbcopy (data) {
  const proc = spawn('pbcopy')
  proc.stdin.write(String(data))
  proc.stdin.end()
}

export function stdev (items) {
  const avg = items.reduce((total, item) => {
    return total + item
  }, 0) / items.length
  const variance = items.reduce((acc, item) => {
    return acc + Math.pow(item - avg, 2)
  }, 0) / (items.length - 1)
  return Math.sqrt(variance)
}
