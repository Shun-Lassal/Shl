import { prisma } from '../../shared/prisma.js';
import { Lobby, NewLobby } from './lobby.model.js';

export type LobbyUpdateData = {
    status?: Lobby['status'];
    name?: string;
    slots?: number;
    ownerId?: string;
    password?: string | null;
};

export class LobbyRepository {

    async createLobby(data: NewLobby): Promise<Lobby> {
        return prisma.lobby.create({
            data: {
                status: data.status,
                name: data.name,
                slots: data.slots,
                ownerId: data.ownerId,
                players: data.players ?? [],
                password: data.password ?? null,
            },
        });
    }

    async listLobbies(): Promise<Array<Lobby>> {
        return prisma.lobby.findMany();
    }

    async getLobbyById(id: string): Promise<Lobby | null> {
        return prisma.lobby.findUnique({ where: { id } });
    }

    async getLobbyByName(name: string): Promise<Lobby | null> {
        return prisma.lobby.findUnique({ where: { name } });
    }

    async updateLobby(id: string, data: LobbyUpdateData): Promise<Lobby> {
        const updateData: Record<string, unknown> = {};

        if (typeof data.status !== 'undefined') {
            updateData.status = data.status;
        }
        if (typeof data.name !== 'undefined') {
            updateData.name = data.name;
        }
        if (typeof data.slots !== 'undefined') {
            updateData.slots = data.slots;
        }
        if (typeof data.ownerId !== 'undefined') {
            updateData.ownerId = data.ownerId;
        }
        if (typeof data.password !== 'undefined') {
            updateData.password = data.password;
        }

        if (Object.keys(updateData).length === 0) {
            throw new Error('No lobby update data provided');
        }

        return prisma.lobby.update({
            where: { id },
            data: updateData,
        });
    }

    async renameLobby(id: string, newName: string): Promise<Lobby> {
        return this.updateLobby(id, { name: newName });
    }

    async updateLobbyStatus(id: string, newStatus: Lobby['status']): Promise<Lobby> {
        return this.updateLobby(id, { status: newStatus });
    }

    async updateLobbySlots(id: string, slots: number): Promise<Lobby> {
        return this.updateLobby(id, { slots });
    }

    async updateLobbyOwner(id: string, ownerId: string): Promise<Lobby> {
        return this.updateLobby(id, { ownerId });
    }

    async updateLobbyPassword(id: string, password: string | null): Promise<Lobby> {
        return this.updateLobby(id, { password });
    }

    async setLobbyPlayers(id: string, players: Array<string>): Promise<Lobby> {
        return prisma.lobby.update({
            where: { id },
            data: { players: { set: players } },
        });
    }

    async addPlayerToLobby(id: string, playerId: string): Promise<Lobby> {
        const lobby = await this.getLobbyOrThrow(id);

        if (lobby.players.includes(playerId)) {
            return lobby;
        }

        if (lobby.players.length >= lobby.slots) {
            throw new Error('Lobby is already full');
        }

        return prisma.lobby.update({
            where: { id },
            data: { players: { push: playerId } },
        });
    }

    async removePlayerFromLobby(id: string, playerId: string): Promise<Lobby> {
        const lobby = await this.getLobbyOrThrow(id);

        if (!lobby.players.includes(playerId)) {
            throw new Error('Player not found in lobby');
        }

        if (lobby.players.length === 1) {
            throw new Error('Cannot remove the last player from the lobby');
        }

        if (lobby.ownerId === playerId) {
            throw new Error('Cannot remove the owner from the lobby');
        }

        const updatedPlayers = lobby.players.filter((player) => player !== playerId);

        return prisma.lobby.update({
            where: { id },
            data: { players: { set: updatedPlayers } },
        });
    }

    async deleteLobby(id: string): Promise<Lobby> {
        return prisma.lobby.delete({ where: { id } });
    }

    private async getLobbyOrThrow(id: string): Promise<Lobby> {
        const lobby = await this.getLobbyById(id);

        if (!lobby) {
            throw new Error('Lobby not found');
        }

        return lobby;
    }

}
