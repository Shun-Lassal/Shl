import type { Request, Response } from "express";
import { LoginService } from "./login.service.ts";

const loginService = new LoginService();

export class LoginController {

  static async loginUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const sessionId = await loginService.authenticate({ email, password });

      if (!sessionId) {
        throw 'Invalid credentials';
      }

      res.status(200)
      .cookie('sid', sessionId, {httpOnly:true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 1000*60*60*24, signed: true})
      .json({ message: 'Login successful' });

    } catch (e) {
      res.status(400).json({ error: e });
    }
  }

  static async logoutUser(req: Request, res: Response) {
    try {
      const sessionId: string = req.signedCookies?.['sid'];
      const sessionRemoved = await loginService.logout(sessionId);
      
      if (!sessionRemoved) {
        throw 'Session already terminated / Not valid';
      }

      res.clearCookie('sid', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });

      res.status(200).json({ message: 'Logged out successfully' });
    } catch (e) {
      res.status(400).json({ error: e });
    }
  }

}
