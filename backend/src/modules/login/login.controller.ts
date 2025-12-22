import { Request, Response } from "express";
import { BaseController } from "../../shared/base/index.ts";
import { LoginService } from "./login.service.ts";

export class LoginController extends BaseController {
  private loginService: LoginService;

  constructor() {
    super();
    this.loginService = new LoginService();
  }

  async loginUser(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const { email, password } = req.body;
      const result = await this.loginService.authenticate({ email, password });

      res
        .status(200)
        .cookie("sid", result.sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 1000 * 60 * 60 * 24,
          signed: true,
        });

      this.sendSuccess(res, { user: result.user }, "Login successful", 200);
    }, req, res);
  }

  async logoutUser(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const sessionId: string = req.signedCookies?.["sid"];
      await this.loginService.logout(sessionId);

      res.clearCookie("sid", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      this.sendSuccess(res, null, "Logged out successfully");
    }, req, res);
  }

  // Static methods for route handlers
  static loginUser = (req: Request, res: Response) => {
    new LoginController().loginUser(req, res);
  };

  static logoutUser = (req: Request, res: Response) => {
    new LoginController().logoutUser(req, res);
  };
}
