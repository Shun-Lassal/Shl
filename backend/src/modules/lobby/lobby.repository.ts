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
            id
        },
        data: {
            players: { push: playerId }
        }})
    }

    // Should I keep the logic here or in lobby.service ?
    // Like, just the DB actions here, and handle the getLobbyPlayers before.
    async removePlayerFromLobby(id: string, playerId: string): Promise<Lobby> {
        const lobby: Lobby = await prisma.lobby.findUnique({
            where: { id },
            select: { players: true },
        });

        if (!lobby) {
            throw 'Lobby not found'
        }

        if (lobby.players.length === 1) {
            throw 'Cannot remove the last player from the lobby';
        }

        if (!lobby.players.includes(playerId)) {
            throw 'Player not found in lobby';
        }

        const updatedPlayers: Array<string> = lobby.players.filter((player: string) => player !== playerId)

        return await prisma.lobby.update({where: {
            id
        },
        data: {
            players: { set: updatedPlayers }
        }})
    }

    async deleteLobby(id: string): Promise<Lobby | null> {
        return await prisma.lobby.delete({where: { id }})
    }

}