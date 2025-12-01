export interface Lobby {
    id: string,
    status: 'WAITING' | 'PLAYING' | 'ENDED',
    name: string,
    slots: number,
    ownerId: string
    players: string[],
    password?: string,
    gameScores?: string[],
}

export interface NewLobby {
    status: 'WAITING',
    name: string,
    slots: number,
    ownerId: string
    players: string[],
    password?: string,
}