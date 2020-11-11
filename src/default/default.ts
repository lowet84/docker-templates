import { ComposeService } from "ComposeFile"
import { getPortainer } from "./portainer"
import { getTraefik } from "./traefik"
import { getWireguard } from "./wireguard"

export const sock = '/var/run/docker.sock:/var/run/docker.sock'

export const getDefaultServices = (
    domain: string,
    volumesLocation: string,
    ssl: boolean,
    forwardAuth: string,
    vpn: boolean
  ): { traefik: ComposeService; portainer: ComposeService, wireguard: ComposeService } => {
    const traefik = getTraefik(volumesLocation, ssl,forwardAuth,domain)
    const portainer = getPortainer(volumesLocation, ssl,forwardAuth,domain)
    const wireguard = vpn ? getWireguard(volumesLocation, ssl,forwardAuth,domain) : undefined

    return { traefik, portainer, wireguard }
  }