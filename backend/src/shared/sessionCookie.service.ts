import { SessionRepository } from "../modules/session/session.repository.js";
import { Session } from '../modules/session/session.model.js'

export class sessionCookieChecker {

    private repo: SessionRepository;
    
    constructor() {
        this.repo = new SessionRepository();
    }

    async getSessionFromCookie(sessionCookie: string) {
        
        // On récupère le cookieSigné, Si vide
        if (!sessionCookie) {
            throw 'Unauthorized: No session cookie';
        }
        
        // On récupère la session dans la BDD, si inexistante
        const session = await this.repo.findBySessionId(sessionCookie);
        if (!session) {
            throw 'Unauthorized: No existing session';
        }
        
        return session;
    }

    async isSessionValid(session: Session) {

        if (session.expiresAt) {
            const currDate = Date.now()
            const expiresTs = new Date(session.expiresAt).getTime();
            // Si date dépassée
            if (currDate > expiresTs) {
                return false;
            }
            const EXTEND_MS = 15 * 60 * 1000;
            
            const remainingMs = expiresTs - currDate;
            // Si session a moins de 5 min, on renouvelle (15min)
            const newExpiry = new Date(currDate + EXTEND_MS);
            await this.repo.updateExpirationDate(session.id, newExpiry);
        }

        return true;
    }
} 