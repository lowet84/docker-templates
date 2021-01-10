export interface Config {
  domain: string
  volumes: string
  data: string
  ssl: boolean
  forwardAuth: string
  vpn: boolean
  apps: {[index: string]: App}
}

export type App = {
    name: string,
    services: PortService[] | number
    configPath: string | {[index:string]: string}
    image?: string
    dataPath?: string,
    environment?: string[],
    command?: string[],
    vpn: boolean,
    ports: string[],
    net: string
}

export type PortService = { name?: string; port: number, insecure?: boolean }