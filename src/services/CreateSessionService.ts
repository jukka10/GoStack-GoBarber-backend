import { sign } from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { compare } from 'bcryptjs';

import User from '../models/User';
import auth from '../config/auth';
import AppError from '../errors/AppError';

interface Request {
  email: string;
  password: string;
}

interface Response {
  user: User;
  token: string;
}
export default class CreateSessionService {
  public async execute({ email, password }: Request): Promise<Response> {
    const usersRespositoy = getRepository(User);

    const user = await usersRespositoy.findOne({
      where: { email },
    });

    if (!user) {
      throw new AppError('Incorrect email/password combination', 401);
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new AppError('Incorrect email/password combination', 401);
    }

    const token = sign({}, auth.secret, {
      subject: user.id,
      expiresIn: auth.expiresIn,
    });

    delete user.password;

    return { user, token };
  }
}
