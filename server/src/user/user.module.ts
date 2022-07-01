import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/mongodb/schemas/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    imports: [
        MongooseModule.forFeature([{name: "User", schema: UserSchema}])
    ],
    providers: [ UserService ],
    controllers: [ UserController ],
    exports: [MongooseModule, UserService ]
})
export class UserModule {}
