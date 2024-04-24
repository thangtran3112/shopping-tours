import { Request } from 'express';
import { IUser } from '../models/userModel';

//allow us to add 'user' field into Request and passing to the next middleware
//property user is present when user is logged in
export type AppRequest = Request & { user?: IUser };
