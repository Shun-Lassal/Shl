import { Request, Response, NextFunction } from 'express'
import { sessionCookieChecker } from '../shared/sessionCookie.service';
import { SessionService } from '../modules/session/session.service';
import { User } from '../modules/user/user.model';
import { UserService } from '../modules/user/user.service';

const sessionChecker = new sessionCookieChecker();

export async function isLoggedInMiddleware(req: Request, res: Response, next: NextFunction) {
    try {

        // On récupère le cookieSigné
        const sessionCookie: string = req.signedCookies?.['sid'];
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

    } catch (e) {
        return res.status(401).json({error: e})
    }
}


export async function isAdminMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const sessionCookie: string = req.signedCookies?.['sid'];

        const sessionChecker = new sessionCookieChecker();
        const session = await sessionChecker.getSessionFromCookie(sessionCookie);
        
        if(!session.userId) {
            throw "Session userId not defined"
        }

        const userService = new UserService();
        const user: User | null = await userService.getUserById(session.userId);

        if (!user) {
            throw "User doesn't exist to check if admin"
        }

        if (user.role == null || user.role !== "ADMIN") {
            throw "User is not an Admin"
        }

        next();
    }
    catch (e)
    {
        return res.status(401).json({error: e})
    }
}