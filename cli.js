#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const minimist = require('minimist')

const package2toml = require('./')
const pkg = require('./package.json')

const argv = minimist(process.argv.slice(2), {
  alias: {
    help: 'h',
    registry: 'r',
    version: 'v',
    user: 'u'
  },
  boolean: [
    'help',
    'version'
  ]
})

function showVersion () {
  console.log(`v${pkg.version}`)
}

function showHelp () {
  const help = path.join(__dirname, 'usage.txt')
  showVersion()
  fs.createReadStream(help).pipe(process.stdout)
}

;(function main (argv) {
  if (argv.help) {
    return showHelp()
  }

  if (argv.version) {
    return showVersion()
  }
  const srcDir = argv._[0] || process.cwd()
  const registry = argv.registry
  const user = argv.user
  package2toml({
    srcDir,
    registry,
    user
  })
})(argv)
