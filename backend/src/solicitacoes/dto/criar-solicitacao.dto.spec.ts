import 'reflect-metadata';

import { describe, expect, it } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CriarSolicitacaoDto } from './criar-solicitacao.dto.js';

describe('CriarSolicitacaoDto', () => {
  const objetoId =
    '550e8400-e29b-41d4-a716-446655440001';

  const opcoes = {
    whitelist: true,
    forbidNonWhitelisted: true,
  };

  it('deve aceitar uma solicitação válida', async () => {
    const dto = plainToInstance(CriarSolicitacaoDto, {
      objetoId,
    });

    const erros = await validate(dto, opcoes);

    expect(erros).toHaveLength(0);
  });

  it('deve rejeitar um objetoId inválido', async () => {
    const dto = plainToInstance(CriarSolicitacaoDto, {
      objetoId: 'abc',
    });

    const erros = await validate(dto, opcoes);

    expect(erros.some(
      (erro) => erro.property === 'objetoId',
    )).toBe(true);
  });

  it('deve rejeitar usuarioId enviado pelo cliente', async () => {
    const dto = plainToInstance(CriarSolicitacaoDto, {
      objetoId,
      usuarioId: '550e8400-e29b-41d4-a716-446655440000',
    });

    const erros = await validate(dto, opcoes);

    expect(erros.some(
      (erro) => erro.property === 'usuarioId',
    )).toBe(true);
  });

  it('deve rejeitar status enviado pelo cliente', async () => {
    const dto = plainToInstance(CriarSolicitacaoDto, {
      objetoId,
      status: 'aprovada',
    });

    const erros = await validate(dto, opcoes);

    expect(erros.some(
      (erro) => erro.property === 'status',
    )).toBe(true);
  });

  it('deve rejeitar campos desconhecidos', async () => {
    const dto = plainToInstance(CriarSolicitacaoDto, {
      objetoId,
      id: 99,
    });

    const erros = await validate(dto, opcoes);

    expect(erros.some(
      (erro) => erro.property === 'id',
    )).toBe(true);
  });
});