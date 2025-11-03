import { Request, Response } from 'express';
import { SessionService } from './session.service';

const sessionService = new SessionService();

export class SessionController {

    static async getSessions(req: Request, res: Response) {
        try {
            const sessions = await sessionService.getAllSessions();
            if (sessions) {
                res.status(200).json(sessions);
            } else {
                throw 'No sessions created';
            }
        }
        catch (e) {
            res.status(400).json({ error: e })
        }
    }
}