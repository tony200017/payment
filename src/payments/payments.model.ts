import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import mongoose from 'mongoose';
export enum Status {
  pending = 'Pending',
  completed = 'Completed',
  failed = 'Failed',
}
export type PaymentDocument = mongoose.HydratedDocument<Payment>;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  userId: mongoose.Types.ObjectId;
  @Prop({ type: String, default: Status.pending })
  status: Status;
  @Prop({ type: String})
  paymentReference: string;
  @Prop({type:Date})
  expireDate:Date;
  @Prop({type:String})
  url:string;
  @Prop({ type: Object })
  result: Object;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
