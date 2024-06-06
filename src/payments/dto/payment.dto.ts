import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Status } from '../payments.model';
import mongoose, { ObjectId } from 'mongoose';

export class InitiatePaymentDto {
  @IsPositive()
  @IsNumber()
  amount: number;
  @IsString()
  currency: string;
}

export class ExecutePaymentDto {
  @IsString()
  paymentMethodId: string;
  @IsNumber()
  amount: number;
  @IsOptional()
  @IsString()
  currency: string;
}

export class ServiceExecutePaymentDto extends ExecutePaymentDto {
  CustomerName: string; //auth
  CustomerEmail: string; //auth
  CallBackUrl: string; //fixed
  ErrorUrl: string; //fixed
  ExpireDate: string; //fixed
}

export class GetPaymentStatusDto {
  @IsString()
  paymentReference: string;
}

export class CreatePaymentDto {
  userId: mongoose.Types.ObjectId;
  paymentReference: string;
  expireDate:Date;
  url:String;
  status?: Status;
  result?: object;
}
