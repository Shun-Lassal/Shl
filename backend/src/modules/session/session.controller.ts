import { Request, Response } from 'express';
import { SessionService } from './session.service';
import { Session } from './session.model';

const sessionService = new SessionService();

export class SessionController {

    static async getSessions(req: Request, res: Response) {
        try {
            const sessions: Session[] = await sessionService.getAllSessions();

            if (!sessions) {
                throw 'No sessions created';
            }
            
            res.status(200).json(sessions);
        }
        catch (e) {
            res.status(400).json({ error: e })
        }
    }
}