export type SimpleService = {
    name: string,
    services: PortService[] | number
    configPath: string | {[index:string]: string}
    image?: string
    dataPath?: string,
    environment?: string[],
    command?: string[],
    vpn: boolean,
    ports: string[]
}

export type PortService = { name?: string; port: number, insecure?: boolean }