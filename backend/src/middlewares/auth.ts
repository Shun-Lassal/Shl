import { SessionService } from "../modules/session/session.service";
import { verifyToken } from "../shared/jwt";

const sessionService = new SessionService();

export class AuthMiddleware {

    async isRegistered(userId: string) {
        sessionService.getSessionByUserId(userId);
    }
}