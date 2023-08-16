import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class DeviceOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;

    console.log(body);
    if (
      !body.owner ||
      !Types.ObjectId.isValid(body.owner as unknown as Types.ObjectId)
    ) {
      throw new BadRequestException(
        'The device must have an owner before it can be added.',
      );
    }
    return new Promise(() => true);
  }
}
