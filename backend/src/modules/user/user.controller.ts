import { Request, Response } from "express";
import { BaseController } from "../../shared/base/index.js";
import { UserService } from "./user.service.js";

export class UserController extends BaseController {
  private userService: UserService;

  constructor() {
    super();
    this.userService = new UserService();
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
      const take = req.query.take ? parseInt(req.query.take as string) : 10;

      const users = await this.userService.getUsers({ skip, take });
      this.sendSuccess(res, users, "Users retrieved successfully");
    }, req, res);
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      this.sendSuccess(res, user);
    }, req, res);
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const { id } = req.params;
      const { email, name } = req.body;

      await this.userService.updateUser(id, { email, name });
      this.sendSuccess(res, null, "User updated successfully");
    }, req, res);
  }

  async updateUserPassword(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const { id } = req.params;
      const { newPassword, oldPassword } = req.body;

      await this.userService.updatePassword(id, newPassword, oldPassword);
      this.sendSuccess(res, null, "Password updated successfully");
    }, req, res);
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const { id } = req.params;
      await this.userService.deleteUser(id);
      this.sendSuccess(res, null, "User deleted successfully");
    }, req, res);
  }

  // Static methods for route handlers
  static getUsers = (req: Request, res: Response) => {
    new UserController().getUsers(req, res);
  };

  static getUserById = (req: Request, res: Response) => {
    new UserController().getUserById(req, res);
  };

  static updateUser = (req: Request, res: Response) => {
    new UserController().updateUser(req, res);
  };

  static updateUserPassword = (req: Request, res: Response) => {
    new UserController().updateUserPassword(req, res);
  };

  static deleteUser = (req: Request, res: Response) => {
    new UserController().deleteUser(req, res);
  };
}
