import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import type { PapelUsuario } from './roles.decorator.js';

export type UsuarioAutenticado = {
  sub: string;
  tipo: PapelUsuario;
};

export const UsuarioAtual = createParamDecorator(
  (
    _dados: unknown,
    context: ExecutionContext,
  ): UsuarioAutenticado => {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: UsuarioAutenticado }>();

    if (!request.user) {
      throw new UnauthorizedException(
        'Autenticação necessária',
      );
    }

    return request.user;
  },
);