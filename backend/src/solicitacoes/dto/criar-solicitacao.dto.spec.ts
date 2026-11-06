import 'reflect-metadata';

import { describe, expect, it } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CriarSolicitacaoDto } from './criar-solicitacao.dto.js';

describe('CriarSolicitacaoDto', () => {
  it('deve aceitar uma solicitação válida', async () => {
    const dto = plainToInstance(CriarSolicitacaoDto, {
      usuarioId: '550e8400-e29b-41d4-a716-446655440000',
      objetoId: '550e8400-e29b-41d4-a716-446655440001',
      status: 'pendente',
    });

    const erros = await validate(dto);

    expect(erros).toHaveLength(0);
  });

  it('deve rejeitar dados inválidos', async () => {
    const dto = plainToInstance(CriarSolicitacaoDto, {
      usuarioId: 'id-invalido',
      objetoId: 'abc',
      status: 'finalizada',
    });

    const erros = await validate(dto);

    expect(erros.map((erro) => erro.property)).toEqual(
      expect.arrayContaining([
        'usuarioId',
        'objetoId',
        'status',
      ]),
    );
  });

  it('deve rejeitar campos desconhecidos', async () => {
    const dto = plainToInstance(CriarSolicitacaoDto, {
      usuarioId: '550e8400-e29b-41d4-a716-446655440000',
      objetoId: '550e8400-e29b-41d4-a716-446655440001',
      status: 'pendente',
      id: 99,
    });

    const erros = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(
      erros.some((erro) => erro.property === 'id'),
    ).toBe(true);
  });
});