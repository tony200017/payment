import mongoose from "mongoose";

export interface User {
    _id: mongoose.Types.ObjectId;
    
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth:Date;
    iat: number,
    exp: number
  }
  
  export class UserRequest extends Request {
    user: User;
  }