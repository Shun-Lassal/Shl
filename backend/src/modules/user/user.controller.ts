import { Request, Response } from 'express';
import { UserService } from './user.service';

const service = new UserService();

export class UserController {
  
  static async getUsers(req: Request, res: Response) {
    const users = await service.getUsers();
    res.json(users);
  }

  // static async getUser(req: Request, res: Response) {
  //   try {
  //     const user = await service.getUser(Number(req.params.id));
  //     res.json(user);
  //   } catch (e: any) {
  //     res.status(404).json({ error: e.message });
  //   }
  // }

  // static async createUser(req: Request, res: Response) {
  //   try {
  //     const { email, name } = req.body;
  //     const user = await service.createUser(email, name);
  //     res.status(201).json(user);
  //   } catch (e: any) {
  //     res.status(400).json({ error: e.message });
  //   }
  // }
}