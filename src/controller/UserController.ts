import { Request, Response } from 'express';
import { Service as Controller } from 'typedi';
import { UserResponseDTO } from '../dto/UserResponseDTO';
import { BusinessException, RequiredFieldException } from '../exception';
import { IControllerResponse } from '../interface/IControllerResponse';
import { IUserPostRequest } from '../interface/IUserPostRequest';
import { UserService } from '../service/UserService';
import { UserRequestValidator } from '../validation/UserRequestValidator';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * @swagger
   * /signup:
   *   post:
   *     summary: Register a new user.
   *     tags: [Sign up]
   *     consumes:
   *       - application/json
   *     produces:
   *       - application/json
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               confirmPassword:
   *                 type: string
   *             example:
   *               email: orion.bootcamp@email.com
   *               password: 12345678aA!
   *               confirmPassword: 12345678aA!
   *     responses:
   *       '201':
   *         description: Returns the user created in the database.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     email:
   *                       type: string
   *               example:
   *                 success: true
   *                 message: 'User created successfully'
   *                 data:
   *                   id: 1
   *                   email: orion.bootcamp@email.com
   *       '400':
   *         description: Returns PasswordMismatchException.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *               example:
   *                 success: false
   *                 message: PasswordMismatchException. The provided password does not match the confirmation password.
   */
  public async signup(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, confirmPassword } = req.body;
      const userPostRequest: IUserPostRequest = { email: email, password: password };

      if (!userPostRequest.email) throw new RequiredFieldException('email');
      if (!userPostRequest.password) throw new RequiredFieldException('password');
      if (!confirmPassword) throw new RequiredFieldException('confirmPassword');

      UserRequestValidator.validateUserEmail(userPostRequest.email);
      UserRequestValidator.validateUserPassword(userPostRequest.password, confirmPassword);

      const userResponse: UserResponseDTO = await this.userService.createUser(userPostRequest);
      const result: IControllerResponse<UserResponseDTO> = { success: true, message: 'User created successfully', data: userResponse };

      res.status(201).json(result);
    } catch (error) {
      const result: IControllerResponse<UserResponseDTO> = { success: false, message: `${error.name}. ${error.message}` };
      const statusCode: number = error instanceof BusinessException ? error.status : 500;

      res.status(statusCode).json(result);
    }
  }
}
