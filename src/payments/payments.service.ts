import { Injectable } from '@nestjs/common';
import {
  CreatePaymentDto,
  ExecutePaymentDto,
  GetPaymentStatusDto,
  InitiatePaymentDto,
  ServiceExecutePaymentDto,
} from './dto/payment.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/global/types';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument, Status } from './payments.model';
import mongoose, { Model } from 'mongoose';
import * as moment from 'moment';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  async initiate(initiatePaymentDto: InitiatePaymentDto) {
    let token = this.configService.get<string>('secrets.myFatoorahToken');
    let baseURL = this.configService.get<string>('baseUrl.myFatoorah');
    let options = {
      method: 'POST',
      url:
        baseURL +
        this.configService.get<string>('myFatoorahApi.initialPayment'),
        token: 'Bearer ' + token,
      body: {
        InvoiceAmount: initiatePaymentDto.amount,
        CurrencyIso: initiatePaymentDto.currency,
      },
    };
    let response = await this.sendData(options);

    const processedPaymentMethods = response.Data.PaymentMethods.map(
      (method: any) => {
        const { ImageUrl, PaymentMethodId, PaymentMethodAr } = method;
        return {
          paymentMethodId: PaymentMethodId,
          imageUrl: ImageUrl,
          paymentMethodName: PaymentMethodAr,
        };
      },
    );

    // Create the final response object
    const finalResponse = {
      isSuccess: response.IsSuccess,
      message: response.Message,
      data: {
        PaymentMethods: processedPaymentMethods,
      },
    };
    return finalResponse;
  }

  async executePayment(executePayment: ExecutePaymentDto, user: User) {
    //check for pending payment that isn't expired
    let pendingPayment = await this.findPayment(user._id);
    if(pendingPayment){
      if(pendingPayment.expireDate< moment().toDate()){
        return   {
          isSuccess: true,
          message: "link already exist",
          data: {
            paymentReference: pendingPayment.paymentReference,
            PaymentUrl:pendingPayment.url,
          },
        };
      }
    } 
   
//fill the field
    let CustomerName = user.firstName + ' ' + user.lastName;
    let CustomerEmail = user.email;
    let CallBackUrl = this.configService.get<string>(
      'myFatoorahApi.callBackUrl',
    );
    let ErrorUrl = this.configService.get<string>('myFatoorahApi.errorUrl');

    let expireDate = moment().add(15,'m').toDate();
    
    let bodyInfo: ServiceExecutePaymentDto = {
      CustomerName,
      CustomerEmail,
      CallBackUrl,
      ErrorUrl,
      ExpireDate: expireDate.toString(),
      ...executePayment,
    };
    let token = this.configService.get<string>('secrets.myFatoorahToken');
    let baseURL = this.configService.get<string>('baseUrl.myFatoorah');
    let options = {
      method: 'POST',
      url:
        baseURL +
        this.configService.get<string>('myFatoorahApi.executePayment'),
        token: 'Bearer ' + token,
      body: {
        PaymentMethodId: bodyInfo.paymentMethodId,
        CustomerName: bodyInfo.CustomerName,
        DisplayCurrencyIso: bodyInfo.currency,
        CustomerEmail: bodyInfo.CustomerEmail,
        InvoiceValue: bodyInfo.amount,
        CallBackUrl: bodyInfo.CallBackUrl,
        ErrorUrl: bodyInfo.ErrorUrl,
      },
    };
    let response = await this.sendData(options);
   
    let createPayment: CreatePaymentDto = {
      userId: new mongoose.Types.ObjectId(user._id),
      paymentReference:response.Data.InvoiceId,
      expireDate:expireDate,
      url:response.Data.PaymentURL
    };
    await this.create(createPayment);
    return {
      isSuccess: response.IsSuccess,
      message: response.Message,
      data: {
        paymentReference: response.Data.InvoiceId,
        paymentUrl: response.Data.PaymentURL,
      },
    };
  }

  async getPaymentStatus(getPaymentStatusDto: GetPaymentStatusDto) {
    let token = this.configService.get<string>('secrets.myFatoorahToken');
    let baseURL = this.configService.get<string>('baseUrl.myFatoorah');
    let options = {
      method: 'POST',
      url:
        baseURL +
        this.configService.get<string>('myFatoorahApi.getPaymentStatus'),
      token: 'Bearer ' + token,
      body: {
        Key: getPaymentStatusDto.paymentReference,
        KeyType: 'InvoiceId',
      },
    };

    let response = await this.sendData(options);
    let paymentId = response.Data.CustomerReference;
    if (response.Data.InvoiceStatus == 'Paid') {
      this.updateByPaymentId(response.Data.InvoiceId, response, Status.completed);
    } else if (response.Data.InvoiceStatus == 'Pending') {
      this.updateByPaymentId(response.Data.InvoiceId, response, Status.pending);
    } else{
      this.updateByPaymentId(response.Data.InvoiceId, response, Status.failed);
    }
    return {
      isSuccess: response.IsSuccess,
      message: response.Message,

      data: {
        paymentReference: response.Data.InvoiceId,
        status: response.Data.InvoiceStatus,
        createdDate: response.Data.CreatedDate,
        expiryDate: response.Data.ExpiryDate,
        expiryTime: response.Data.ExpiryTime,
        invoiceValue: response.Data.InvoiceValue,

        customerName: response.Data.CustomerName,

        customerEmail: response.Data.CustomerEmail,
      },
    };
  }

  async create(createPaymentDto: CreatePaymentDto) {
    const createdPayment = await new this.paymentModel(createPaymentDto).save();
    return createdPayment._id;
  }
  async updateByPaymentId(paymentReference, response: Object, status: Status) {
    await this.paymentModel.updateOne({paymentReference:paymentReference}, {
      status: status,
      result: response,
    });
  }
  async findPayment(userId) {
    return await this.paymentModel.findOne({ userId: userId, status: Status.pending });
   
  }

  async sendData(options) {
    try {
      let response = await firstValueFrom(
        this.httpService.post(options.url, options.body, {
          headers:  {
            Authorization: options.token,
          },
        }),
      );
      return response.data;
    } catch (error) {
      return error.response.data;
    }
  }
}
