#!/usr/bin/env node
import { generate } from './generator'
import * as YAML from 'yaml'
import * as fs from 'fs'

let configString = fs.readFileSync('config.json', 'utf8')
const secrets = fs.existsSync('secrets.json')
  ? JSON.parse(fs.readFileSync('secrets.json', 'utf8'))
  : undefined
if (secrets)
  Object.keys(secrets).forEach((secretKey) => {
    configString = configString.replace(
      new RegExp(`#${secretKey}#`, 'g'),
      secrets[secretKey]
    )
  })
const config = JSON.parse(configString)
const apps = Object.keys(config.apps).map(key=>({...config.apps[key], name: key}))
let compose = generate(
  config.domain,
  config.volumes,
  config.data,
  apps,
  config.ssl,
  config.forwardAuth,
  config.vpn
)

let specialString = fs.existsSync('special.yaml')
  ? fs.readFileSync('special.yaml', 'utf8')
  : undefined
if (secrets && specialString){
  Object.keys(secrets).forEach((secretKey) => {
    specialString = specialString.replace(
      new RegExp(`#${secretKey}#`, 'g'),
      secrets[secretKey]
    )
  })
  specialString = specialString.replace(
    new RegExp('#CONFIG_PATH#', 'g'),
    config.volumes
  )
}
if (specialString) {
  const special = YAML.parse(specialString)
  compose.services = { ...compose.services, ...special.services }
}
fs.writeFileSync('docker-compose.yaml', YAML.stringify(compose), 'utf8')
