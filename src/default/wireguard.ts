import { ComposeService } from 'ComposeFile'

export const getWireguard = (
  volumesLocation: string,
  ssl: boolean,
  forwardAuth: string,
  domain: string
) => {
  const wireguard: ComposeService = {
    container_name: 'wireguard',
    image: 'ghcr.io/linuxserver/wireguard',
    restart: 'always',
    volumes: [
      `${volumesLocation}/wireguard:/config`,
      '/lib/modules:/lib/modules',
    ],
    // ports: ['51820:51820/udp'],
    environment: ['PUID=1000', 'PGID=1000', 'TZ=Europe/Stockholm'],
    cap_add: ['NET_ADMIN', 'SYS_MODULE'],
    sysctls: [
      'net.ipv4.conf.all.src_valid_mark=1',
      'net.ipv6.conf.all.disable_ipv6=0',
    ],
  }
  return wireguard
}
