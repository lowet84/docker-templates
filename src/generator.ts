import { ComposeFile, ComposeService } from 'ComposeFile'
import { getDefaultServices } from './default/default'
import { getLabels } from './lables'
import { PortService, SimpleService } from 'Service'

const getSimpleService = (
  service: SimpleService,
  volumesLocation: string,
  dataLocation: string,
  domain: string,
  ssl: boolean,
  forwardAuth: string
): ComposeService => {
  const volumes: string[] = []
  if (service.configPath) {
    if (typeof service.configPath == 'string') {
      volumes.push(`${volumesLocation}/${service.name}:${service.configPath}`)
    } else {
      const keys = Object.keys(service.configPath)
      keys.forEach((key) => {
        volumes.push(
          `${volumesLocation}/${service.name}/${key}:${
            (<any>service.configPath)[key]
          }`
        )
      })
    }
  }

  if (service.dataPath)
    volumes.push(`${dataLocation}:${service.dataPath || '/mnt'}`)
  const services =
    !service.services ? [] :
    typeof service.services == 'number'
      ? [{ name: '', port: service.services }]
      : (<PortService[]>service.services).map((s, index) => ({
          name: s.name || `${index == 0 ? '' : `${service.name}${index}`}`,
          port: s.port,
          insecure: s.insecure || false,
        }))
  let ret: ComposeService = {
    image: service.image || service.name,
    container_name: service.name,
    restart: 'always',
    volumes,
    labels: getLabels(domain, service.name, services, ssl, forwardAuth),
    environment: service.environment || [],
    command: service.command || [],
    network_mode: service.vpn ? 'service:wireguard' : undefined,
  }
  if(service.ports) ret.ports = service.ports
  if (service.image?.includes("ghcr.io/linuxserver"))
    ret.environment.push(...['PUID=1000', 'PGID=1000', 'TZ=Europe/Stockholm'])
  if (!service.vpn) delete ret.network_mode

  return ret
}

export const generate = (
  domain: string,
  volumesLocation: string,
  dataLocation: string,
  simpleServices: SimpleService[],
  ssl: boolean,
  forwardAuth: string,
  vpn: boolean
): ComposeFile => {
  const defaultServices = getDefaultServices(
    domain,
    volumesLocation,
    ssl,
    forwardAuth,
    vpn
  )
  const services: { [index: string]: ComposeService } = {}
  const simpleServicesCompose = simpleServices.reduce((acc, cur) => {
    acc[cur.name] = getSimpleService(
      cur,
      volumesLocation,
      dataLocation,
      domain,
      ssl,
      forwardAuth
    )
    return acc
  }, services)

  return {
    version: '3',
    services: {
      ...defaultServices,
      ...simpleServicesCompose,
    },
  }
}
