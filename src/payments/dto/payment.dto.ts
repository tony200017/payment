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
  InvoiceAmount: number;
  @IsString()
  CurrencyIso: string;
}

class InvoiceItem {
  @IsString()
  ItemName: string;

  @IsNumber()
  @Min(1)
  Quantity: number;

  @IsNumber()
  @Min(0)
  UnitPrice: number;
}

class CustomerAddress {
  @IsString()
  Block: string;

  @IsString()
  Street: string;

  @IsString()
  HouseBuildingNo: string;

  @IsString()
  @IsOptional()
  Address?: string;

  @IsString()
  @IsOptional()
  AddressInstructions?: string;
}

export class ExecutePaymentDto {
  @IsString()
  PaymentMethodId: string;
  @IsNumber()
  InvoiceValue: number;
  @IsOptional()
  @IsString()
  DisplayCurrencyIso: string;
  @IsOptional()
  @IsString()
  MobileCountryCode: string;
  @IsOptional()
  @IsString()
  CustomerMobile: string;
  @IsOptional()
  @IsString()
  Language: string;
  @IsString()
  @IsOptional()
  CustomerCivilId: string;
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerAddress)
  CustomerAddress: CustomerAddress;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItem)
  InvoiceItems: InvoiceItem[];
}

export class ServiceExecutePaymentDto extends ExecutePaymentDto {
  CustomerName: string; //auth
  CustomerEmail: string; //auth
  CallBackUrl: string; //fixed
  ErrorUrl: string; //fixed
  CustomerReference: mongoose.Types.ObjectId; //fixed
  ExpireDate: string; //fixed
}

export class GetPaymentStatusDto {
  @IsString()
  Key: string;
  @IsString()
  KeyType: string;
}

export class CreatePaymentDto {
  userId: mongoose.Types.ObjectId;

  status?: Status;

  result?: object;
}
