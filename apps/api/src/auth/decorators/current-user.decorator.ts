import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload, JwtPayloadWithRefreshToken } from '../types/jwt-payload.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload | JwtPayloadWithRefreshToken => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
