import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'
import callsites from 'callsites'
import serialize from 'serialize-javascript'
import { logInfo, logWarning } from './logger.js'
import { escapeBacktickString } from './utils.js'

const SNAPSHOT_BANNER = '// Data Snap v1'
const SNAPSHOT_EXT = 'snap'
const SNAPSHOT_DIR = '__snapshots__'

const hasUpdateFlag = () => {
  const argv = process.argv.slice(2)
  return ['--updateSnapshot', '-u'].some((d) => argv.includes(d))
}

const resolveCallerPath = () => {
  const stack = callsites()
  const callingFile = stack[2].getFileName()
  return url.fileURLToPath(callingFile)
}

const resolveSnapshotPath = (callerPath) => {
  const basename = path.basename(callerPath)
  const dirname = path.dirname(callerPath)
  return path.resolve(dirname, SNAPSHOT_DIR, `${basename}.${SNAPSHOT_EXT}`)
}

const readSnapshot = async (snapshotPath) => {
  try {
    await fs.access(snapshotPath, fs.constants.R_OK)
    return fs.readFile(snapshotPath, 'utf-8')
  } catch {
    /* no op */
  }
}

const loadSnapshotData = (snapshotContent) => {
  const data = {}

  try {
    const populate = new Function('exports', snapshotContent)
    populate(data)
  } catch {
    /* no op */
  }

  return data
}

const serializeSnapshot = (value) => {
  return serialize(value, { space: 2 })
}

const formatSnapshot = (snapshotData) => {
  const keys = Object.keys(snapshotData).sort()

  const snapshots = keys.map((name) => {
    const key = escapeBacktickString(name)
    const value = serializeSnapshot(snapshotData[key])

    return `exports[\`${key}\`] = ${value}`
  })

  return `${SNAPSHOT_BANNER}\n\n${snapshots.join('\n\n')}\n`
}

const saveSnapshot = async (snapshotPath, snapshotContent) => {
  await fs.mkdir(path.dirname(snapshotPath), { recursive: true })
  await fs.writeFile(snapshotPath, snapshotContent, 'utf-8')
}

const snap = async (key, value, opts = {}) => {
  const callerPath = resolveCallerPath()
  const relCallerPath = path.relative(process.cwd(), callerPath)
  const snapshotPath = resolveSnapshotPath(callerPath)

  const snapshotContent = await readSnapshot(snapshotPath)
  const snapshotData = snapshotContent ? loadSnapshotData(snapshotContent) : {}

  const snapshot = snapshotData[key] || {}

  const update = opts.update || hasUpdateFlag()

  if (snapshot.data !== undefined && !update) {
    if (snapshot.meta.expires && snapshot.meta.expires < Date.now()) {
      logWarning(`Snapshot data for "${key}" in ${relCallerPath} has expired`)
    }

    return snapshot.data
  }

  logInfo(`Updating snapshot data for "${key}" in ${relCallerPath}`)

  snapshotData[key] = {
    data: value,
    meta: {
      expires: opts.expires || null,
    },
  }

  const newSnapshotContent = formatSnapshot(snapshotData)
  await saveSnapshot(snapshotPath, newSnapshotContent)

  return value
}

export default snap
