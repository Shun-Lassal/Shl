import express from "express";
import { UserController } from './user.controller.ts';
import { isAdminMiddleware, isLoggedInMiddleware } from '../../middlewares/auth.ts';

const router = express.Router();

router.get('/', isLoggedInMiddleware, UserController.getUsers);

router.put('/:id', isLoggedInMiddleware, UserController.updateUser);

router.patch('/:id/password', isLoggedInMiddleware, UserController.updateUserPassword);

router.delete('/:id', isLoggedInMiddleware, isAdminMiddleware, UserController.deleteUser);
// router.get('/:name', UserController.getUserByName);
// router.get('/:id', UserController.getUser);
// router.post('/', UserController.createUser);
export default router;
