import { ComposeFile, ComposeService } from 'ComposeFile'
import { PortService, SimpleService } from 'Service'

const getLabels = (
  domain: string,
  name: string,
  services: { name?: string; port: number, insecure?: boolean }[],
  ssl: boolean,
  forwardAuth: string
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
    ret.push(`traefik.http.routers.${name}${service.name || ''}.entrypoints=${ssl ? 'websecure' : 'web'}`)
    ret.push(`traefik.http.routers.${name}${service.name || ''}.service=${name}${service.name || ''}`)
    if(!!forwardAuth && !service.insecure)
    {
      ret.push(`traefik.http.middlewares.${name}${service.name || ''}.forwardauth.address=${forwardAuth}`)
      ret.push(`traefik.http.routers.${name}${service.name || ''}.middlewares=${name}${service.name || ''}@docker`)
    }
    
    if(ssl)
      ret.push(`traefik.http.routers.${name}${service.name || ''}.tls.certresolver=default`)
  })

  return ret
}

const getDefaultServices = (
  domain: string,
  volumesLocation: string,
  ssl: boolean,
  forwardAuth: string
): { traefik: ComposeService; portainer: ComposeService } => {
  const traefik: ComposeService = {
    container_name: 'traefik',
    image: 'traefik',
    restart: 'always',
    volumes: [sock, `${volumesLocation}/traefik:/data`],
    labels: getLabels(domain, 'traefik', [{ port: 8080 }], ssl, forwardAuth),
    ports: ['80:80', '443:443'],
    command: [
      '--providers.docker=true',
      '--providers.docker.exposedByDefault=false',
      '--api.insecure=true',
      '--log.level=DEBUG',
      '--entrypoints.web.address=:80'
    ]
  }
  if (ssl) {
    traefik.command.push(...[
      '--entrypoints.websecure.address=:443',
      '--entrypoints.web.http.redirections.entryPoint.to=websecure',
      '--certificatesresolvers.default.acme.httpchallenge=true',
      '--certificatesresolvers.default.acme.httpchallenge.entrypoint=web',
      '--certificatesresolvers.default.acme.email=fredrik.lowenhamn@gmail.com',
      '--certificatesresolvers.default.acme.storage=/data/acme.json',
    ])
  }

  const portainer: ComposeService = {
    image: 'portainer/portainer-ce:alpine',
    container_name: 'portainer',
    volumes: [`${volumesLocation}/portainer:/data`, sock],
    restart: 'always',
    labels: getLabels(domain, 'portainer', [{ port: 9000 }], ssl, forwardAuth)
  }

  return { traefik, portainer }
}

const getSimpleService = (
  service: SimpleService,
  volumesLocation: string,
  dataLocation: string,
  domain: string,
  ssl: boolean,
  forwardAuth: string
): ComposeService => {
  const volumes: string[] = []
  if (service.configPath)
    volumes.push(`${volumesLocation}/${service.name}:${service.configPath}`)
  if (service.mountData) volumes.push(`${dataLocation}:/mnt`)
  const services =
    typeof service.services == 'number'
      ? [{ name: '', port: service.services }]
      : (<PortService[]>service.services).map(
      (s, index) => ({
        name: s.name || `${index == 0 ? '' : `${service.name}${index}`}`,
        port: s.port,
        insecure: s.insecure || false
      })
      )
  return {
    image: service.image || service.name,
    container_name: service.name,
    restart: 'always',
    volumes,
    labels: getLabels(domain, service.name, services, ssl, forwardAuth),
    environment: service.environment || [],
    command: service.command || []
  }
}

const sock = '/var/run/docker.sock:/var/run/docker.sock'

export const generate = (
  domain: string,
  volumesLocation: string,
  dataLocation: string,
  simpleServices: SimpleService[],
  ssl: boolean,
  forwardAuth: string
): ComposeFile => {
  const { traefik, portainer } = getDefaultServices(domain, volumesLocation, ssl, forwardAuth)
  const services: { [index: string]: ComposeService } = {}
  const simpleServicesCompose = simpleServices.reduce((acc, cur) => {
    acc[cur.name] = getSimpleService(cur, volumesLocation, dataLocation, domain, ssl, forwardAuth)
    return acc
  }, services)

  return {
    version: '3',
    services: {
      traefik,
      portainer,
      ...simpleServicesCompose
    }
  }
}
