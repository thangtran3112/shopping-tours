import { Request } from 'express';
import { IUser } from '../models/userModel';

//allow us to add 'user' field into Request and passing to the next middleware
export type AppRequest = Request & { user?: IUser };
