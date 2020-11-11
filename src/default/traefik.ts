import { ComposeService } from "ComposeFile"
import { getLabels } from "../lables"
import { sock } from "./default"

export const getTraefik = (volumesLocation: string, ssl: boolean, forwardAuth: string, domain: string)=>{
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
        '--entrypoints.web.address=:80',
      ],
    }
    if (ssl) {
      traefik.command.push(
        ...[
          '--entrypoints.websecure.address=:443',
          '--entrypoints.web.http.redirections.entryPoint.to=websecure',
          '--certificatesresolvers.default.acme.httpchallenge=true',
          '--certificatesresolvers.default.acme.httpchallenge.entrypoint=web',
          '--certificatesresolvers.default.acme.email=fredrik.lowenhamn@gmail.com',
          '--certificatesresolvers.default.acme.storage=/data/acme.json',
        ]
      )
    }
    return traefik
  }