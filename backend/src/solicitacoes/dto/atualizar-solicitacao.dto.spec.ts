import 'reflect-metadata';

import { describe, expect, it } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AtualizarSolicitacaoDto } from './atualizar-solicitacao.dto.js';

describe('AtualizarSolicitacaoDto', () => {
  const opcoes = {
    whitelist: true,
    forbidNonWhitelisted: true,
  };

  it('deve aceitar uma atualização parcial válida', async () => {
    const dto = plainToInstance(AtualizarSolicitacaoDto, {
      status: 'aprovada',
    });

    const erros = await validate(dto, opcoes);

    expect(erros).toHaveLength(0);
  });

  it('deve rejeitar dados inválidos', async () => {
    const dto = plainToInstance(AtualizarSolicitacaoDto, {
      objetoId: 'abc',
      status: 'finalizada',
    });

    const erros = await validate(dto, opcoes);

    expect(erros.map((erro) => erro.property)).toEqual(
      expect.arrayContaining(['objetoId', 'status']),
    );
  });

  it('deve impedir a alteração do proprietário', async () => {
    const dto = plainToInstance(AtualizarSolicitacaoDto, {
      usuarioId: '550e8400-e29b-41d4-a716-446655440000',
    });

    const erros = await validate(dto, opcoes);

    expect(erros.some(
      (erro) => erro.property === 'usuarioId',
    )).toBe(true);
  });

  it('deve rejeitar a alteração do ID', async () => {
    const dto = plainToInstance(AtualizarSolicitacaoDto, {
      id: 99,
      status: 'aprovada',
    });

    const erros = await validate(dto, opcoes);

    expect(erros.some(
      (erro) => erro.property === 'id',
    )).toBe(true);
  });
});