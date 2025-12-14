import { Request, Response } from "express";
import { BaseController } from "../../shared/base/index.ts";
import { RegisterService } from "./register.service.ts";

export class RegisterController extends BaseController {
  private registerService: RegisterService;

  constructor() {
    super();
    this.registerService = new RegisterService();
  }

  async registerUser(req: Request, res: Response): Promise<void> {
    await this.executeAsync(async () => {
      const { email, name, password, role } = req.body;

      await this.registerService.register({
        email,
        name,
        password,
        role,
      });

      this.sendSuccess(res, null, "User registered successfully", 201);
    }, req, res);
  }

  // Static method for route handler
  static registerUser = (req: Request, res: Response) => {
    new RegisterController().registerUser(req, res);
  };
}
