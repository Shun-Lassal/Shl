import { Request, Response, NextFunction } from 'express'
import { sessionCookieChecker } from '../shared/sessionCookie.service';

const sessionChecker = new sessionCookieChecker();

export async function isLoggedInMiddleware(req: Request, res: Response, next: NextFunction) {
    try {

        // On récupère le cookieSigné
        const sessionCookie: string = req.signedCookies['sid'];
        const session = await sessionChecker.getSessionFromCookie(sessionCookie);

        const result = await sessionChecker.isSessionValid(session);
        if(!result) {
            throw 'Session is invalid (SHOULD NOT HAPPEN)'
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