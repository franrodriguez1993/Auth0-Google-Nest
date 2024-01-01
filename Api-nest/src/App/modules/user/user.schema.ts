import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = User & Document;

@Schema({
  versionKey: false,
  timestamps: {
    createdAt: true,
    updatedAt: true,
  },
})
export class User {
  @Prop({ default: '' })
  firstName: string;
  @Prop({ default: '' })
  lastName: string;
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ unique: true })
  auth0Id: string;
  @Prop({ default: '' })
  profilePic: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
