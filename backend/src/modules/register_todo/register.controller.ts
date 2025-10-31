import { Request, Response } from 'express';
import { RegisterService } from './register.service';

const registerService = new RegisterService();

export class RegisterController {
  
  static async registerUser(req: Request, res: Response) {
    const user = req.body;
    const result = await registerService.register(user);
    if (result) {
      res.status(201).send({ message: 'User registered successfully' });
    } else {
      res.status(400).send({ message: 'User registration failed' });
    }
  }
  
}