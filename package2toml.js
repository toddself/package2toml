const fs = require('fs')
const url = require('url')
const path = require('path')
const { promisify } = require('util')
const execAsync = promisify(require('child_process').exec)

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)

async function read (src) {
  const pkgFile = path.join(src, 'package.json')
  let data = {}
  try {
    const fd = await readFileAsync(pkgFile, 'utf8')
    data = JSON.parse(fd)
    return data
  } catch (err) {
    console.log(`Failed to read or parse package.json at ${pkgFile}`)
    console.log(err)
    throw err
  }
}

function formatTOML (data, user, registry) {
  const toml = `
name = "${user}@${registry}/${data.name}"
version = "${data.version}"

[dependencies]
${Object.keys(data.dependencies).map(k => `"legacy@${registry}/${k}" = "${data.dependencies[k]}"`).join('\n')}
`
  return toml
}

async function write (src, data) {
  const tomlFile = path.join(src, 'Package.toml')
  try {
    await writeFileAsync(tomlFile, data, 'utf8')
  } catch (err) {
    console.log(`Failed to write Package.toml at ${tomlFile}`)
    console.log(err)
    throw err
  }
}

async function getUser (registry) {
  const reg = registry ? `https://${registry}` : null
  const cmd = `ds whoami ${reg ? `--registry=${reg}` : ''}`
  try {
    const output = await execAsync(cmd)
    return output.stdout.trim()
  } catch (err) {
    console.log('Could not get username from `ds whoami` and no --user was specified')
    console.log(err)
    throw err
  }
}

async function main (opts) {
  const srcDir = opts.srcDir || process.cwd()
  let registry = opts.registry || 'registry.entropic.dev'
  if (registry.includes('/')) {
    registry = url.parse(registry).hostname
  }

  const user = opts.user || await getUser(registry)

  const data = await read(srcDir)
  const toml = formatTOML(data, user, registry)
  await write(srcDir, toml)
}

module.exports = main
