import { describe, expect, it, vi } from 'vitest';
import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RolesGuard } from './roles.guard.js';
import type { PapelUsuario } from '../decorators/roles.decorator.js';

describe('RolesGuard', () => {
  const criarContexto = (tipo?: PapelUsuario) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user: tipo
            ? { sub: 'usuario-uuid', tipo }
            : undefined,
        }),
      }),
      getHandler: () => () => {},
      getClass: () => class {},
    }) as unknown as ExecutionContext;

  const criarGuard = (roles?: PapelUsuario[]) => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(roles),
    };

    return new RolesGuard(
      reflector as unknown as Reflector,
    );
  };

  it('deve rejeitar usuários não autenticados', () => {
    const guard = criarGuard(['docente']);

    expect(() =>
      guard.canActivate(criarContexto()),
    ).toThrow(UnauthorizedException);
  });

  it('deve permitir aluno em rota sem restrição de papel', () => {
    const guard = criarGuard();

    expect(
      guard.canActivate(criarContexto('aluno')),
    ).toBe(true);
  });

  it('deve permitir docente em rota exclusiva para docentes', () => {
    const guard = criarGuard(['docente']);

    expect(
      guard.canActivate(criarContexto('docente')),
    ).toBe(true);
  });

  it('deve impedir aluno de acessar rota de docente', () => {
    const guard = criarGuard(['docente']);

    expect(() =>
      guard.canActivate(criarContexto('aluno')),
    ).toThrow(ForbiddenException);
  });

  it('deve permitir aluno em rota exclusiva para alunos', () => {
    const guard = criarGuard(['aluno']);

    expect(
      guard.canActivate(criarContexto('aluno')),
    ).toBe(true);
  });
});