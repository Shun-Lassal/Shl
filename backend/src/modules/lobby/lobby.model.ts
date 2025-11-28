export interface Lobby {
    id: string,
    status: 'WAITING' | 'PLAYING' | 'ENDED',
    name: string,
    slots: number,
    players: string[],
    password?: string,
    gameScores?: string[]
}

export interface NewLobby {
    status: 'WAITING',
    name: string,
    slots: number,
    players: string[],
    password?: string
}