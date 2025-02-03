import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { logger } from '../utils/logger.js';

export interface Routes {
  path?: string;
  router: Router;
}

export class UserRoute implements Routes {
  public path = '/api/user';
  public router: Router;
  public userController = new UserController();

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    logger.debug('User Route has been initialized!');

    this.router.get(`${this.path}`, (req, res) => {
      res.status(200).json({
        message: 'Hello World! User Route',
      });
    });
    this.router.post(`${this.path}/createUser`, this.userController.createUser);
    this.router.post(`${this.path}/createRoom`, this.userController.createRoom);
  }
}
