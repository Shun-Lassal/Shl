import { Request, Response } from 'express';
import { RegisterService } from './register.service';

const registerService = new RegisterService();

export class RegisterController {
  
  static async registerUser(req: Request, res: Response) {
    try {
      const { email, name, password, role } = req.body;
      const result = await registerService.register({email, name, password, role});
      
      if (!result) {
        throw 'User registration failed'
      }

      res.status(201).send({ message: 'User registered successfully' });
    } catch (e) {
      res.status(400).json({ error: e });
    }
  }
  
}
