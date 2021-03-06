export type ComposeFile = {
    version: string
    services: {
      [index: string]: ComposeService
    }
  }
  
  export type ComposeService = {
    image: string
    container_name?: string
    labels?: string[]
    volumes?: string[]
    ports?: string[]
    command?: string[]
    restart?: string,
    environment?: string[],
    command?: string[],
    cap_add?: string[],
    sysctls?: string[],
    network_mode?: string
  }
