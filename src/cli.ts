import * as YAML from 'yaml'
import * as fs from 'fs'
import { createDockerCompose } from './main'

const configString = fs.readFileSync('config.json', 'utf8')
const secrets = fs.existsSync('secrets.json')
  ? JSON.parse(fs.readFileSync('secrets.json', 'utf8'))
  : undefined
const compose = createDockerCompose(JSON.parse(configString), secrets)

fs.writeFileSync('docker-compose.yaml', YAML.stringify(compose), 'utf8')
