export type SimpleService = {
    name: string,
    services: { name?: string; port: number }[] | number
    configPath: string
    image?: string
    mountData?: boolean,
    environment?: string[]
}
