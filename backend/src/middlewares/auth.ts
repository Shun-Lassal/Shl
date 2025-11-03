import { SessionService } from "../modules/session/session.service";
import { Request, Response, NextFunction } from 'express'

const sessionService = new SessionService();

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    
    const sessionCookie: string = req.cookies['sid'];
    if (!sessionCookie) {
        return res.status(401).json({ message: 'Unauthorized: No session cookie' });
    }
    
    const session = await sessionService.getSessionBySessionId(sessionCookie);
    if (!session) {
        return res.status(401).json({ message: 'Unauthorized: Invalid session' });
    }

}