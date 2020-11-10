#!/usr/bin/env node
import { generate } from './generator'
import * as YAML from 'yaml'
import * as fs from 'fs'

let configString = fs.readFileSync("config.json", 'utf8')
const secrets = fs.existsSync("secrets.json") ? JSON.parse(fs.readFileSync("secrets.json",'utf8')) : undefined
if(secrets)
  Object.keys(secrets).forEach(secretKey=>{
    configString = configString.replace(new RegExp(`#${secretKey}#`, "g"), secrets[secretKey])
  })
const config = JSON.parse(configString)

const compose = generate(config.domain, config.volumes, config.data,
  Object.values(config.apps), config.ssl, config.forwardAuth
)
fs.writeFileSync('docker-compose.yaml', YAML.stringify(compose), 'utf8')
