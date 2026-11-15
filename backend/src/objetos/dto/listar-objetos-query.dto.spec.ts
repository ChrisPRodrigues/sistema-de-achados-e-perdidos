import 'reflect-metadata';

import { describe, expect, it } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ListarObjetosQueryDto } from './listar-objetos-query.dto.js';

describe('ListarObjetosQueryDto', () => {
  it('deve utilizar os valores padrão', async () => {
    const dto = plainToInstance(ListarObjetosQueryDto, {});

    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve aceitar parâmetros válidos', async () => {
    const dto = plainToInstance(ListarObjetosQueryDto, {
      page: '2',
      limit: '20',
    });

    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(20);
    expect(await validate(dto)).toHaveLength(0);
  });

  it('deve rejeitar valores fora dos limites', async () => {
    const dto = plainToInstance(ListarObjetosQueryDto, {
      page: '0',
      limit: '200',
    });

    const erros = await validate(dto);

    expect(erros.map((erro) => erro.property)).toEqual(
      expect.arrayContaining(['page', 'limit']),
    );
  });

  it('deve rejeitar valores que não sejam inteiros', async () => {
    const dto = plainToInstance(ListarObjetosQueryDto, {
      page: 'abc',
      limit: '1.5',
    });

    const erros = await validate(dto);

    expect(erros.map((erro) => erro.property)).toEqual(
      expect.arrayContaining(['page', 'limit']),
    );
  });
});