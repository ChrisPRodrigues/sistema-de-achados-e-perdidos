import { describe, expect, it } from 'vitest';
import { ForbiddenException } from '@nestjs/common';

import { verificarPropriedade } from './propriedade.js';
import type { UsuarioAutenticado } from '../decorators/usuario-atual.decorator.js';

describe('Verificação de propriedade', () => {
  const aluno: UsuarioAutenticado = {
    sub: 'aluno-1',
    tipo: 'aluno',
  };

  const docente: UsuarioAutenticado = {
    sub: 'docente-1',
    tipo: 'docente',
  };

  it('deve permitir acesso ao próprio recurso', () => {
    expect(() =>
      verificarPropriedade(aluno, 'aluno-1'),
    ).not.toThrow();
  });

  it('deve impedir acesso ao recurso de outro aluno', () => {
    expect(() =>
      verificarPropriedade(aluno, 'aluno-2'),
    ).toThrow(ForbiddenException);
  });

  it('deve impedir acesso de aluno mesmo com exceção para docente', () => {
    expect(() =>
      verificarPropriedade(aluno, 'aluno-2', true),
    ).toThrow(ForbiddenException);
  });

  it('deve permitir acesso do docente quando autorizado', () => {
    expect(() =>
      verificarPropriedade(docente, 'aluno-1', true),
    ).not.toThrow();
  });

  it('deve impedir acesso do docente sem permissão especial', () => {
    expect(() =>
      verificarPropriedade(docente, 'aluno-1'),
    ).toThrow(ForbiddenException);
  });

  it('deve permitir que o docente acesse seu próprio recurso', () => {
    expect(() =>
      verificarPropriedade(docente, 'docente-1'),
    ).not.toThrow();
  });
});