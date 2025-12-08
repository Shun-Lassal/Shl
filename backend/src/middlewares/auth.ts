import type { Request, Response, NextFunction } from "express";
import { sessionCookieChecker } from "../shared/sessionCookie.service.ts";
import { SessionService } from "../modules/session/session.service.ts";
import type { User } from "../modules/user/user.model.ts";
import { UserService } from "../modules/user/user.service.ts";
import type { Session } from "../modules/session/session.model.ts";

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
            const oldSession = await sessionService.deleteSessionBySessionId(session.id);
            if(!oldSession) {
                console.log("An older session could not be deleted")
            }
            throw 'Session too old'
        }

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
