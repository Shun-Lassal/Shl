import { Router } from 'express';
import { UserController } from './user.controller';

const router = Router();

router.get('/', UserController.getUsers);
// router.get('/:name', UserController.getUserByName);
// router.get('/:id', UserController.getUser);
// router.post('/', UserController.createUser);

export default router;