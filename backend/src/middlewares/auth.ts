import type { Request, Response, NextFunction } from "express";
import { sessionCookieChecker } from "../shared/sessionCookie.service;
import { SessionService } from .js"../modules/session/session.service;
import type { User } from "../modules/user/user.model;
import { UserService } from .js"../modules/user/user.service;
import type { Session } from "../modules/session/session.model;

// Je pense que le mieux serait de tout check dans un Service et non dans le controlleur middleware auth
// Ou est-ce déjà le mieux que je puisse faire ?
export async function isLoggedInMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        // On récupère le cookieSigné
        const sessionCookie: string = req.signedCookies?.['sid'];

        const sessionChecker = new sessionCookieChecker();
        const session: Session = await sessionChecker.getSessionFromCookie(sessionCookie);
        // Verifie si session valide / reprolonge la session
        const result: boolean = await sessionChecker.isSessionValid(session);

        // session invalide
        if(!result) {
            const sessionService = new SessionService();
            await sessionService.deleteSessionBySessionId(session.id);
            throw 'Session too old'
        }

        if (!session.userId) {
            throw "Session userId not defined"
        }

        res.locals.userId = session.userId;
        res.locals.sessionId = session.id;

        next();
    } catch (e) {
        return res.status(401).json({error: e})
    }
}

// Je pense que le mieux serait de tout check dans un Service et non dans le controlleur middleware auth
// Ou est-ce déjà le mieux que je puisse faire ?
export async function isAdminMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const sessionCookie: string = req.signedCookies?.['sid'];

        const sessionChecker = new sessionCookieChecker();
        const session = await sessionChecker.getSessionFromCookie(sessionCookie);
        
        if(!session.userId) {
            throw "Session userId not defined"
        }

        const userService = new UserService();
        const user = await userService.getUserById(session.userId);

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
