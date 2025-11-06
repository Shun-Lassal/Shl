import { Request, Response } from 'express';
import { UserService } from './user.service';

const userService = new UserService();

export class UserController {
  
  static async getUsers(req: Request, res: Response) {
    try {
      const users = await userService.getUsers();
      res.status(200).json(users);
    }
    catch (e) {
      res.status(400).json({ error: e })
    }
  }

  static async updateUserPassword(req: Request, res: Response){
    try {
      const { userId, newPassword, oldPassword } = req.body
      const userService = new UserService();
      const passwordChanged: Promise<boolean> = userService.updatePassword(userId, newPassword, oldPassword);

      if (!passwordChanged) {
        throw "Password has not changed"
      }
      
      res.status(200).json({ message: "Password has been updated" })
    } catch (e) {
      res.status(401).json({ error: e })
    }
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