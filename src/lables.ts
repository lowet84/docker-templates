export const getLabels = (
    domain: string,
    name: string,
    services: { name?: string; port: number; insecure?: boolean }[],
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
      ret.push(
        `traefik.http.routers.${name}${service.name || ''}.entrypoints=${
          ssl ? 'websecure' : 'web'
        }`
      )
      ret.push(
        `traefik.http.routers.${name}${service.name || ''}.service=${name}${
          service.name || ''
        }`
      )
      if (!!forwardAuth && !service.insecure) {
        ret.push(
          `traefik.http.middlewares.${name}${
            service.name || ''
          }.forwardauth.address=${forwardAuth}`
        )
        ret.push(
          `traefik.http.routers.${name}${service.name || ''}.middlewares=${name}${
            service.name || ''
          }@docker`
        )
      }
  
      if (ssl)
        ret.push(
          `traefik.http.routers.${name}${
            service.name || ''
          }.tls.certresolver=default`
        )
    })
  
    return ret
  }