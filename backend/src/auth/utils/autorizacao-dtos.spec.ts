import 'reflect-metadata';

import { describe, expect, it } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CriarObjetoDto } from '../../objetos/dto/criar-objeto.dto.js';
import { AtualizarObjetoDto } from '../../objetos/dto/atualizar-objeto.dto.js';
import { CriarDevolucaoDto } from '../../devolucoes/dto/criar-devolucao.dto.js';
import { RegistrarDevolucaoDto } from '../../devolucoes/dto/registrar-devolucao.dto.js';
import { AtualizarDevolucaoDto } from '../../devolucoes/dto/atualizar-devolucao.dto.js';

describe('Proteção dos DTOs contra IDs indevidos', () => {
  const uuid = '550e8400-e29b-41d4-a716-446655440000';

  const opcoes = {
    whitelist: true,
    forbidNonWhitelisted: true,
  };

  const dadosObjeto = {
    nome: 'Mochila',
    descricao: 'Mochila encontrada',
    categoriaId: uuid,
    localId: uuid,
    dataEncontrado: '2026-11-26T12:00:00Z',
  };

  it('deve aceitar cadastro de objeto sem usuarioId', async () => {
    const dto = plainToInstance(
      CriarObjetoDto,
      dadosObjeto,
    );

    const erros = await validate(dto, opcoes);

    expect(erros).toHaveLength(0);
  });

  it('deve rejeitar usuarioId no cadastro de objeto', async () => {
    const dto = plainToInstance(CriarObjetoDto, {
      ...dadosObjeto,
      usuarioId: uuid,
    });

    const erros = await validate(dto, opcoes);

    expect(erros).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'usuarioId',
        }),
      ]),
    );
  });

  it('deve rejeitar alteração do proprietário do objeto', async () => {
    const dto = plainToInstance(AtualizarObjetoDto, {
      usuarioId: uuid,
    });

    const erros = await validate(dto, opcoes);

    expect(erros).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'usuarioId',
        }),
      ]),
    );
  });

  it('deve aceitar criação de devolução sem usuarioId', async () => {
    const dto = plainToInstance(CriarDevolucaoDto, {
      objetoId: uuid,
      observacao: 'Objeto entregue',
    });

    const erros = await validate(dto, opcoes);

    expect(erros).toHaveLength(0);
  });

  it('deve rejeitar usuarioId na criação de devolução', async () => {
    const dto = plainToInstance(CriarDevolucaoDto, {
      objetoId: uuid,
      usuarioId: uuid,
    });

    const erros = await validate(dto, opcoes);

    expect(erros).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'usuarioId',
        }),
      ]),
    );
  });

  it('deve rejeitar usuarioId no registro de devolução pelo objeto', async () => {
    const dto = plainToInstance(RegistrarDevolucaoDto, {
      usuarioId: uuid,
      observacao: 'Objeto entregue',
    });

    const erros = await validate(dto, opcoes);

    expect(erros).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'usuarioId',
        }),
      ]),
    );
  });

  it('deve rejeitar alteração do responsável pela devolução', async () => {
    const dto = plainToInstance(AtualizarDevolucaoDto, {
      usuarioId: uuid,
    });

    const erros = await validate(dto, opcoes);

    expect(erros).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'usuarioId',
        }),
      ]),
    );
  });
});