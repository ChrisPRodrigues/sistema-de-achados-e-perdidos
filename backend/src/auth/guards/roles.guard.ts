import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  ROLES_KEY,
  type PapelUsuario,
} from '../decorators/roles.decorator.js';

type RequisicaoAutenticada = {
  user?: {
    sub: string;
    tipo: PapelUsuario;
  };
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<RequisicaoAutenticada>();

    if (!request.user) {
      throw new UnauthorizedException(
        'Autenticação necessária',
      );
    }

    const rolesPermitidas =
      this.reflector.getAllAndOverride<PapelUsuario[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (!rolesPermitidas?.length) {
      return true;
    }

    if (!rolesPermitidas.includes(request.user.tipo)) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este recurso',
      );
    }

    return true;
  }
}