import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type UsuarioAutenticado = {
  sub: string;
  tipo: 'aluno' | 'docente';
};

type RequisicaoAutenticada = {
  headers: {
    authorization?: string;
  };
  user?: UsuarioAutenticado;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequisicaoAutenticada>();

    const [tipo, token] =
      request.headers.authorization?.split(' ') ?? [];

    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Token ausente ou inválido',
      );
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<UsuarioAutenticado>(
          token,
        );

      if (
        typeof payload.sub !== 'string' ||
        !['aluno', 'docente'].includes(payload.tipo)
      ) {
        throw new UnauthorizedException('Token inválido');
      }

      request.user = {
        sub: payload.sub,
        tipo: payload.tipo,
      };

      return true;
    } catch {
      throw new UnauthorizedException(
        'Token inválido ou expirado',
      );
    }
  }
}