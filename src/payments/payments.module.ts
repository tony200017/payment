import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './payments.model';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [],
      useFactory: async () => ({
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        json: true,
      }),
      
    }),
    
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
