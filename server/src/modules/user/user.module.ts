import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from 'src/database/mongodb/models/user.model';

@Module({
  imports: [
    User,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [MongooseModule, UserService],
})
export class UserModule {}
