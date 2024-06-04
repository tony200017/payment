import { HttpException, Injectable } from '@nestjs/common';
import {
  CreatePaymentDto,
  ExecutePaymentDto,
  GetPaymentStatusDto,
  InitiatePaymentDto,
  ServiceExecutePaymentDto,
} from './dto/payment.dto';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/global/types';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument, Status } from './payments.model';
import mongoose, { Model } from 'mongoose';

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
      url: baseURL + '/v2/InitiatePayment',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: initiatePaymentDto,
      json: true,
    };
    try {
      let response = await firstValueFrom(
        this.httpService.post(options.url, options.body, {
          headers: options.headers,
        }),
      );
      return response.data;
    } catch (error) {
      return error.response.data;
    }
  }

  async executePayment(executePayment: ExecutePaymentDto, user: User) {
    let createdPayment: CreatePaymentDto = {
      userId: new mongoose.Types.ObjectId(user._id),
    };
    let paymentId = await this.create(createdPayment);
    let CustomerName = user.firstName + ' ' + user.lastName; //auth
    let CustomerEmail = user.email; //auth
    let CallBackUrl = 'http://localhost:3004/'; //fixed
    let ErrorUrl = 'http://localhost:3004/'; //fixed
    let CustomerReference = paymentId; //fixed
    let ExpireDate = new Date(); //fixed
    ExpireDate.setHours(ExpireDate.getHours() + 1);
    let bodyInfo: ServiceExecutePaymentDto = {
      CustomerName,
      CustomerEmail,
      CallBackUrl,
      ErrorUrl,
      CustomerReference,
      ExpireDate: ExpireDate.toString(),
      ...executePayment,
    };
    let token = this.configService.get<string>('secrets.myFatoorahToken');
    let baseURL = this.configService.get<string>('baseUrl.myFatoorah');
    let options = {
      method: 'POST',
      url: baseURL + '/v2/ExecutePayment',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: bodyInfo,
      json: true,
    };

    return this.httpService
      .post(options.url, options.body, { headers: options.headers })
      .pipe(map((response) => response.data));
  }

  async getPaymentStatus(getPaymentStatusDto: GetPaymentStatusDto) {
    let token = this.configService.get<string>('secrets.myFatoorahToken');
    let baseURL = this.configService.get<string>('baseUrl.myFatoorah');
    let options = {
      method: 'POST',
      url: baseURL + '/v2/getPaymentStatus',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: getPaymentStatusDto,
      json: true,
    };

    try {
      let response = await firstValueFrom(
        this.httpService.post(options.url, options.body, {
          headers: options.headers,
        }),
      );
      let paymentId = response.data.Data.CustomerReference;

      if (response.data.Data.InvoiceStatus=="Paid") {
        await this.paymentModel.findByIdAndUpdate(paymentId, {
          status: Status.completed,
          result: response.data,
        });
      } else {
        await this.paymentModel.findByIdAndUpdate(paymentId, {
          status: Status.pending,
          result: response.data,
        });
      }
      return response.data;
    } catch (error) {
      return error.response.data;
    }
  }

  async create(createPaymentDto: CreatePaymentDto) {
    const createdPayment = await new this.paymentModel(createPaymentDto).save();
    return createdPayment._id;
  }
}
