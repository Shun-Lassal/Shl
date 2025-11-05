import { Router } from 'express';
import { UserController } from './user.controller';
import { isLoggedInMiddleware } from '../../middlewares/auth';

const router = Router();

router.get('/', isLoggedInMiddleware, UserController.getUsers);
// router.get('/:name', UserController.getUserByName);
// router.get('/:id', UserController.getUser);
// router.post('/', UserController.createUser);

export default router;