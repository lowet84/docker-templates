export type SimpleService = {
    name: string,
    services: PortService[] | number
    configPath: string | {[index:string]: string}
    image?: string
    dataPath?: string,
    environment?: string[],
    command?: string[],
    vpn: boolean
}

export type PortService = { name?: string; port: number, insecure?: boolean }