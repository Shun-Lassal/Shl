import { prisma } from '../../shared/prisma.js';
import { Lobby, NewLobby } from './lobby.model.js';

export class LobbyRepository {

    async createLobby(data: NewLobby): Promise<Lobby | null> {
        return await prisma.lobby.create({data: {
            status: data.status,
            name: data.name,
            slots: data.slots,
            players: data.players,
            password: data.password,
        }});
    }

    async addPlayerToLobby(id: string, playerId: string): Promise<Lobby> {
        return await prisma.lobby.update({where: {
            id: id
        },
        data: {
            players: playerId 
        }})
    }

}