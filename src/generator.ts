import { ComposeFile, ComposeService } from 'ComposeFile'
import { SimpleService } from 'Service'

const getLabels = (
  domain: string,
  name: string,
  services: { name?: string; port: number }[]
) => {
  const ret = ['traefik.enable=true']
  services.forEach((service) => {
    ret.push(
      `traefik.http.routers.${name}${service.name || ''}.rule=Host(\`${
        service.name || name
      }.${domain}\`)`
    )
    ret.push(
      `traefik.http.services.${name}${
        service.name || ''
      }.loadbalancer.server.port=${service.port}`
    )
  })
  return ret
}

const getDefaultServices = (
  domain: string,
  volumesLocation: string
): { traefik: ComposeService; portainer: ComposeService } => {
  const traefik: ComposeService = {
    container_name: 'traefik',
    image: 'traefik',
    restart: 'always',
    volumes: [sock],
    labels: getLabels(domain, 'traefik', [{ port: 8080 }]),
    ports: ['8000:80'],
    command: [
      '--providers.docker=true',
      '--providers.docker.exposedByDefault=false',
      '--api.insecure=true',
      '--log.level=DEBUG',
    ],
  }

  const portainer: ComposeService = {
    image: 'portainer/portainer-ce',
    container_name: 'portainer',
    volumes: [`${volumesLocation}/portainer:/data`, sock],
    restart: 'always',
    labels: getLabels(domain, 'portainer', [{ port: 9000 }]),
  }

  return { traefik, portainer }
}

const getSimpleService = (
  service: SimpleService,
  volumesLocation: string,
  dataLocation: string,
  domain: string
): ComposeService => {
  const volumes: string[] = []
  if (service.configPath)
    volumes.push(`${volumesLocation}/${service.name}:${service.configPath}`)
  if (service.mountData) volumes.push(`${dataLocation}:/mnt`)
  const services =
    typeof service.services == 'number'
      ? [{ name: '', port: service.services }]
      : (<{ name?: string; port: number }[]>service.services).map(
          (s, index) => ({
            name: s.name || `${index == 0 ? '' : `${service.name}${index}`}`,
            port: s.port,
          })
        )
  return {
    image: service.image || service.name,
    container_name: service.name,
    restart: 'always',
    volumes,
    labels: getLabels(domain, service.name, services),
  }
}

const sock = '/var/run/docker.sock:/var/run/docker.sock'

export const generate = (
  domain: string,
  volumesLocation: string,
  dataLocation: string,
  simpleServices: SimpleService[]
): ComposeFile => {
  const { traefik, portainer } = getDefaultServices(domain, volumesLocation)
  const services: { [index: string]: ComposeService } = {}
  const simpleServicesCompose = simpleServices.reduce((acc, cur) => {
    acc[cur.name] = getSimpleService(cur, volumesLocation, dataLocation, domain)
    return acc
  }, services)

  return {
    version: '3',
    services: {
      traefik,
      portainer,
      ...simpleServicesCompose,
    },
  }
}
