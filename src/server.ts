#!/usr/bin/env node
import { generate } from './generator'
import * as YAML from 'yaml'
import * as fs from 'fs'
import { SimpleService } from 'Service'

const sonarr: SimpleService = {
  image: 'linuxserver/sonarr',
  name: 'sonarr',
  configPath: '/config',
  mountData: true,
  services: [{ name: 'sonarr', port: 8989 }],
}
const radarr: SimpleService = {
  image: 'linuxserver/radarr',
  name: 'radarr',
  configPath: '/config',
  mountData: true,
  services: [{ port: 7878 }],
}
const rethinkdb: SimpleService = {
  name: 'rethinkdb',
  configPath: '/data',
  services: 8080,
}

const compose = generate('pi.com', 'C:\\temp\\volumes', 'C:\\temp\\data', [
  sonarr,
  radarr,
  rethinkdb,
])
fs.writeFileSync('docker-compose.yaml', YAML.stringify(compose), 'utf8')
