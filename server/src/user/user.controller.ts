import { Body, Controller, Delete, Get, HttpStatus, NotFoundException, Param, Post, Put, Query, Res } from '@nestjs/common';
import { CreateUserDTO } from 'src/mongodb/dto/create-user.dto';
import { UserService } from './user.service';
import { ValidateObjectId } from '../mongodb/shared/pipes/validate-object-id.pipes';
import { ApiTags, ApiOperation, ApiOkResponse, ApiNotFoundResponse, ApiParam, ApiBody } from "@nestjs/swagger";

@ApiTags("user")
@Controller("/users")
export class UserController {
    constructor(private userService: UserService) {}

    @ApiOperation({
        summary: 'Create a new user.',
        description: 'Create a new user. Users are required to add devices.',
    })
    @ApiOkResponse({ description: "Success message" })
    @Post("/")
    async addUser(@Res() res, @Body() createUserDto: CreateUserDTO) {
        const newUser = await this.userService.addUser(createUserDto)
        return res.status(HttpStatus.OK).json({
            message: "User has been created successfully!",
            user: newUser
        })
    }

    @ApiOperation({
        summary: 'Get a user.',
        description: 'Get a user.',
    })
    @ApiParam({ name: "userId", type: "string" })
    @ApiOkResponse({ description: "Success message" })
    @ApiNotFoundResponse({ description: "User was not found or does not exist." })
    @Get("/:userId")
    async getUser(
        @Res() res, 
        @Param("userId", new ValidateObjectId()) userId
    ) {
        const user = await this.userService.getUser(userId);
        if (!user) {
            throw new NotFoundException("User does not exist");
        }
        return res.status(HttpStatus.OK).json(user);
    }

    @ApiOperation({
        summary: 'Get a list of users.',
        description: 'Get a list of users.',
    })
    @ApiOkResponse({ description: "Success message" })
    @Get("/")
    async getUsers(@Res() res) {
        const users = await this.userService.getUsers();
        return res.status(HttpStatus.OK).json(users);
    }

    @ApiOperation({
        summary: 'Update a user.',
        description: 'Update a user instance.',
    })
    @ApiParam({ name: "userId", type: "string" })
    @ApiBody({ type: CreateUserDTO })
    @ApiOkResponse({ description: "Success message" })
    @ApiNotFoundResponse({ description: "User was not found or does not exist." })
    @Put("/:userId")
    async editUser(
        @Res() res, 
        @Param("userId", new ValidateObjectId()) userId,
        @Body() createUserDto: CreateUserDTO
    ) {
        const editedUser = await this.userService.editUser(userId, createUserDto);
        if (!editedUser) {
            throw new NotFoundException("User does not exist");
        }
        return res.status(HttpStatus.OK).json({
            message: "User has been successfully updated",
            user: editedUser
        });
    }

    @ApiOperation({
        summary: 'Remove a user.',
        description: `Remove a user. 
        When a user instance is removed all references to devices will be broken. 
        Please make sure that corresponding devices (and their related data) are cleared first.`,
    })
    @ApiParam({ name: "userId", type: "string" })
    @ApiOkResponse({ description: "Success message" })
    @ApiNotFoundResponse({ description: "User was not found or does not exist." })
    @Delete("/:userId")
    async deleteUser(
        @Res() res, 
        @Param("userId", new ValidateObjectId()) userId
    ) {
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
