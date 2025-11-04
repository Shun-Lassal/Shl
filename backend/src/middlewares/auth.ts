import { Request, Response, NextFunction } from 'express'
import { sessionCookieChecker } from '../shared/sessionCookie.service';
import { SessionService } from '../modules/session/session.service';

const sessionChecker = new sessionCookieChecker();

export async function isLoggedInMiddleware(req: Request, res: Response, next: NextFunction) {
    try {

        // On récupère le cookieSigné
        const sessionCookie: string = req.cookies?.['sid'];
        console.log(sessionCookie);
        const session = await sessionChecker.getSessionFromCookie(sessionCookie);

        const result: boolean = await sessionChecker.isSessionValid(session);
        if(!result) {
            const sessionService = new SessionService();
            const oldSession = await sessionService.deleteSessionBySessionId(session.id);
            if(!oldSession) {
                throw 'Session is invalid'
            }
            throw 'Session too old'
        }
        next();

    } catch (err) {
        return res.status(401).json({error: err})
    }


}


export async function isAdminMiddleware() {
    try {
        // To do
    }
    catch (e)
    {

    }
}