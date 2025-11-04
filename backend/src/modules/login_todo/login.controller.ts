import { Request, Response } from 'express';
import { LoginService } from './login.service';

const loginService = new LoginService();

export class LoginController {

  static async loginUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const sessionId = await loginService.authenticate({ email, password });
      if (sessionId) {
        res.status(200).cookie('sid', sessionId, {httpOnly:true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 1000*60*60*24});
        res.status(200).json({ message: 'Login successful' });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (e) {
      res.status(400).json({ error: e });
    }
  }

  static async logoutUser(req: Request, res: Response) {
    try {
      const sessionId: string = req.cookies?.['sid'];
      if (!sessionId) {
        return res.status(400).json({ message: 'No session cookie provided' });
      }

      const sessionRemoved = await loginService.logout(sessionId);
      res.clearCookie('sid', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });

      res.status(200).json({ message: sessionRemoved ? 'Logged out successfully' : 'Session already terminated' });
    } catch (e: any) {
      res.status(400).json({ error: e?.message ?? e });
    }
  }

}
