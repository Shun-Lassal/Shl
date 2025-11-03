import { Request, Response } from 'express';
import { LoginService } from './login.service';

const loginService = new LoginService();

export class LoginController {

  static async loginUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const sessionId = await loginService.authenticate({ email, password });
      if (sessionId) {
        res.status(200).json({ sessionId: sessionId });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  static async logoutUser(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        await loginService.logout(token);
        res.status(200).json({ message: 'Logged out successfully' });
      } else {
        res.status(400).json({ message: 'No token provided' });
      }
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

}