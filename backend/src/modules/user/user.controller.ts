import type { Request, Response } from "express";
import { UserService } from "./user.service.ts";
import type { User } from "./user.model.ts";

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

  static async updateUser(req: Request, res: Response) {
    try {
      const userId: string = req.params.id;
      const user: User = req.body;

      const userService = new UserService();
      const isUpdated = await userService.updateUser(userId, user)

      if (!isUpdated) {
        throw "User has not been updated"
      }

      res.status(200).json({ message: "User has been updated" })
    }
    catch (e) {
      res.status(401).json({error: e})
    }
  }

  static async updateUserPassword(req: Request, res: Response) {
    try {

      const userId = req.params.id;
      const { newPassword, oldPassword }: { newPassword: string; oldPassword: string } = req.body;

      const userService = new UserService();
      await userService.updatePassword(userId, newPassword, oldPassword);
      
      res.status(200).json({ message: "Password has been updated" })
    } catch (e) {
      res.status(401).json({ error: e })
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const userId: string = req.params.id;
      
      const userService = new UserService();
      await userService.deleteUser(userId)
      
      res.status(200).json({ message: "User has been deleted" })
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
