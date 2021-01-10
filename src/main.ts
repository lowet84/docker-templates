#!/usr/bin/env node
import { generate } from './generator'
import { Config } from 'Config'

export function createDockerCompose(
  originalConfig: Config,
  secrets: { [index: string]: string } | undefined
) {
  let configString = JSON.stringify(originalConfig)
  if (secrets)
    Object.keys(secrets).forEach((secretKey) => {
      configString = configString.replace(
        new RegExp(`#${secretKey}#`, 'g'),
        secrets[secretKey]
      )
    })
  const config = JSON.parse(configString) as Config
  const apps = Object.keys(config.apps).map((key) => ({
    ...config.apps[key],
    name: key,
  }))
  let compose = generate(
    config.domain,
    config.volumes,
    config.data,
    apps,
    config.ssl,
    config.forwardAuth,
    config.vpn
  )
  return compose
}
