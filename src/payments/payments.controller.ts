import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import {
  ExecutePaymentDto,
  GetPaymentStatusDto,
  InitiatePaymentDto,
} from './dto/payment.dto';
import { AuthGuard } from 'src/guards/authentication';
import { UserRequest } from 'src/global/types';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}
  @UseGuards(AuthGuard)
  @Post('initiate')
  initiate(@Body() InitiatePaymentDto: InitiatePaymentDto) {
    return this.paymentsService.initiate(InitiatePaymentDto);
  }
  @UseGuards(AuthGuard)
  @Post('execute')
  execute(
    @Body() executePaymentDto: ExecutePaymentDto,
    @Request() req: UserRequest,
  ) {
    return this.paymentsService.executePayment(executePaymentDto, req.user);
  }
  @UseGuards(AuthGuard)
  @Post('PaymentStatus')
  getPaymentStatus(@Body() getPaymentStatus: GetPaymentStatusDto) {
    return this.paymentsService.getPaymentStatus(getPaymentStatus);
  }
}
