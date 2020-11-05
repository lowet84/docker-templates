export type SimpleService = {
    name: string,
    services: PortService[] | number
    configPath: string
    image?: string
    mountData?: boolean,
    environment?: string[]
}

export type PortService = { name?: string; port: number, insecure?: boolean }