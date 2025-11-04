import { SessionRepository } from "../modules/session/session.repository";
import { Session } from '../modules/session/session.model'

export class sessionCookieChecker {

    private repo: SessionRepository;
    
    constructor() {
        this.repo = new SessionRepository();
    }

    async getSessionFromCookie(sessionCookie: string) {
        
        // On récupère le cookieSigné, Si non valide
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
            const expiresTs = new Date(session.expiresAt).getTime();
            const remainingMs = expiresTs - Date.now();

            // Si date dépassée
            if (Date.now() > expiresTs) {
                throw 'Unauthorized: Session expired';
            }

            const FIVE_MIN_MS = 5 * 60 * 1000;
            const EXTEND_MS = 15 * 60 * 1000;

            // Si session a moins de 5 min, on renouvelle (15min)
            if (remainingMs < FIVE_MIN_MS) {
                const newExpiry = new Date(Date.now() + EXTEND_MS);
                await this.repo.updateExpirationDate(session.id, newExpiry);
            }
        }

        return true;
    }
} 