import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDTO } from 'src/mongodb/dto/create-user.dto';
import { User } from 'src/mongodb/interfaces/user.interface';

@Injectable()
export class UserService {
    constructor(@InjectModel("User") private readonly userModel: Model<User>) {}

    async addUser(createUserDto: CreateUserDTO): Promise<User> {
        const newUser = new this.userModel(createUserDto);
        return newUser.save();
    }

    async getUser(userId): Promise<User> {
        const user = await this.userModel.findById(userId).exec();
        return user;
    }

    async getUsers(): Promise<User[]> {
        const users = await this.userModel.find().exec();
        return users;
    }

    async editUser(userId, createUserDto: CreateUserDTO): Promise<User> {
        const editedUser = await this.userModel.findByIdAndUpdate(userId, createUserDto, { new: true }).exec();
        return editedUser;
    }

    async deleteUser(userId): Promise<any> {
        const deletedUser = await this.userModel.findByIdAndRemove(userId).exec();
        return deletedUser;
    }
}
