import { ComposeService } from "ComposeFile"
import { getLabels } from "../lables"
import { sock } from "./default"

export const getPortainer = (volumesLocation: string, ssl: boolean, forwardAuth: string, domain: string)=>{
    const portainer: ComposeService = {
      image: 'portainer/portainer-ce:alpine',
      container_name: 'portainer',
      volumes: [`${volumesLocation}/portainer:/data`, sock],
      restart: 'always',
      labels: getLabels(domain, 'portainer', [{ port: 9000 }], ssl, forwardAuth),
    }
  
    return portainer
  }