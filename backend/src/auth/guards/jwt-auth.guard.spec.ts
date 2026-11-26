import { describe, expect, it, vi } from 'vitest';
import {
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtAuthGuard } from './jwt-auth.guard.js';

describe('JwtAuthGuard', () => {
  const criarContexto = (request: object) =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as unknown as ExecutionContext;

  it('deve rejeitar requisições sem token', async () => {
    const jwtService = {
      verifyAsync: vi.fn(),
    };

    const guard = new JwtAuthGuard(
      jwtService as unknown as JwtService,
    );

    const contexto = criarContexto({
      headers: {},
    });

    await expect(
      guard.canActivate(contexto),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('deve aceitar um token válido', async () => {
    const jwtService = {
      verifyAsync: vi.fn().mockResolvedValue({
        sub: 'usuario-uuid',
        tipo: 'aluno',
      }),
    };

    const guard = new JwtAuthGuard(
      jwtService as unknown as JwtService,
    );

    const request = {
      headers: {
        authorization: 'Bearer token-valido',
      },
      user: undefined as unknown,
    };

    const resultado = await guard.canActivate(
      criarContexto(request),
    );

    expect(resultado).toBe(true);
    expect(request.user).toEqual({
      sub: 'usuario-uuid',
      tipo: 'aluno',
    });
  });

  it('deve rejeitar um token inválido', async () => {
    const jwtService = {
      verifyAsync: vi.fn().mockRejectedValue(
        new Error('Assinatura inválida'),
      ),
    };

    const guard = new JwtAuthGuard(
      jwtService as unknown as JwtService,
    );

    const contexto = criarContexto({
      headers: {
        authorization: 'Bearer token-invalido',
      },
    });

    await expect(
      guard.canActivate(contexto),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('deve rejeitar um papel desconhecido', async () => {
    const jwtService = {
      verifyAsync: vi.fn().mockResolvedValue({
        sub: 'usuario-uuid',
        tipo: 'admin',
      }),
    };

    const guard = new JwtAuthGuard(
      jwtService as unknown as JwtService,
    );

    const contexto = criarContexto({
      headers: {
        authorization: 'Bearer token-teste',
      },
    });

    await expect(
      guard.canActivate(contexto),
    ).rejects.toThrow(UnauthorizedException);
  });
});