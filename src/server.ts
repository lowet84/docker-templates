#!/usr/bin/env node
import { generate } from './generator'
import * as YAML from 'yaml'
import * as fs from 'fs'
import { SimpleService } from 'Service'

const config = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))

const compose = generate(config.domain, config.volumes, config.data,
  Object.values(config.apps)
)
fs.writeFileSync('docker-compose.yaml', YAML.stringify(compose), 'utf8')
