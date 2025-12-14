import { Request, Response } from "express";
import { BaseController } from "../../shared/base/index.ts";
import { SessionService } from "./session.service.ts";

export class SessionController extends BaseController {
  private sessionService: SessionService;

  constructor() {
    super();
    this.sessionService = new SessionService();
  }

  async getSessions(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const sessions = await this.sessionService.getAllSessions();
      this.sendSuccess(res, sessions, "Sessions retrieved successfully");
    }, req, res);
  }

  async getSessionById(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const { id } = req.params;
      const session = await this.sessionService.getSessionBySessionId(id);
      this.sendSuccess(res, session);
    }, req, res);
  }

  async deleteSession(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const { id } = req.params;
      await this.sessionService.deleteSessionBySessionId(id);
      this.sendSuccess(res, null, "Session deleted successfully");
    }, req, res);
  }

  // Static methods for route handlers
  static getSessions = (req: Request, res: Response) => {
    new SessionController().getSessions(req, res);
  };

  static getSessionById = (req: Request, res: Response) => {
    new SessionController().getSessionById(req, res);
  };

  static deleteSession = (req: Request, res: Response) => {
    new SessionController().deleteSession(req, res);
  };
}
