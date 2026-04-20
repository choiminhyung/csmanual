import fs from 'fs'
import path from 'path'

export function getManualContent(): string {
  const manualPath = process.env.MANUAL_PATH
    ? path.resolve(process.env.MANUAL_PATH)
    : path.join(process.cwd(), '..', 'cs-manual.md')

  return fs.readFileSync(manualPath, 'utf-8')
}
