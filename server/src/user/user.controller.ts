import { Body, Controller, Delete, Get, HttpStatus, NotFoundException, Param, Post, Put, Query, Res } from '@nestjs/common';
import { CreateUserDTO } from 'src/mongodb/dto/create-user.dto';
import { UserService } from './user.service';
import { ValidateObjectId } from '../mongodb/shared/pipes/validate-object-id.pipes';

@Controller("/users")
export class UserController {
    constructor(private userService: UserService) {}

    @Post("/")
    async addUser(@Res() res, @Body() createUserDto: CreateUserDTO) {
        const newUser = await this.userService.addUser(createUserDto)
        return res.status(HttpStatus.OK).json({
            message: "User has been created successfully!",
            user: newUser
        })
    }

    @Get("/:userId")
    async getUser(@Res() res, @Param("userId", new ValidateObjectId()) userId) {
        const user = await this.userService.getUser(userId);
        if (!user) {
            throw new NotFoundException("User does not exist");
        }
        return res.status(HttpStatus.OK).json(user);
    }

    @Get("/")
    async getUsers(@Res() res) {
        const users = await this.userService.getUsers();
        return res.status(HttpStatus.OK).json(users);
    }

    @Put("/edit")
    async editUser(@Res() res, @Query("userId", new ValidateObjectId()) userId, @Body() createUserDto: CreateUserDTO) {
        const editedUser = await this.userService.editUser(userId, createUserDto);
        if (!editedUser) {
            throw new NotFoundException("User does not exist");
        }
        return res.status(HttpStatus.OK).json({
            message: "User has been successfully updated",
            user: editedUser
        });
    }

    @Delete("/delete")
    async deleteUser(@Res() res, @Query("userId", new ValidateObjectId()) userId) {
        const deletedUser = await this.userService.deleteUser(userId);
        if(!deletedUser) {
            throw new NotFoundException("User does not exist");
        }
        return res.status(HttpStatus.OK).json({
            message: "User has been successfully deleted",
            user: deletedUser
        })
    }
}
