import { spawn } from 'child_process'

export function pbcopy (data: string): void {
  const proc = spawn('pbcopy')
  proc.stdin.write(String(data));
  proc.stdin.end();
}

export function stdev (items: number[]): number {
  if (items.length === 0) {
    return NaN;
  }

  const avg = items.reduce((total: number, item: number) => {
    return total + item;
  }, 0) / items.length;

  const variance = items.reduce((acc: number, item: number) => {
    return acc + Math.pow(item - avg, 2);
  }, 0) / (items.length - 1);

  return Math.sqrt(variance);
}

export function average (items: number[]): number {
  return items.reduce((total: number, item: number) => {
    return total + item;
  }, 0) / items.length;
}
