import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ListarObjetosService } from './listar-objetos.service.js';
import { ObjetoEntity } from './entities/objeto.entity.js';

describe('ListarObjetosService', () => {
  let service: ListarObjetosService;

  const findAndCount = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListarObjetosService,
        {
          provide: getRepositoryToken(ObjetoEntity),
          useValue: { findAndCount },
        },
      ],
    }).compile();

    service = module.get<ListarObjetosService>(
      ListarObjetosService,
    );
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve listar objetos com paginação e relacionamentos', async () => {
    const objetos = [
      { id: 'uuid-objeto', nome: 'Mochila' },
    ];

    findAndCount.mockResolvedValue([objetos, 1]);

    const resultado = await service.listar({
      page: 2,
      limit: 10,
    });

    expect(findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        relations: {
          categoria: true,
          localEncontrado: true,
          usuario: true,
        },
        relationLoadStrategy: 'join',
        skip: 10,
        take: 10,
        order: { id: 'ASC' },
      }),
    );

    expect(resultado).toEqual({
      objetos,
      total: 1,
    });
  });

  it('deve aplicar os filtros informados', async () => {
    findAndCount.mockResolvedValue([[], 0]);

    await service.listar({
      page: 1,
      limit: 10,
      nome: 'Mochila',
      status: 'encontrado',
      categoriaId: 'uuid-categoria',
      localId: 'uuid-local',
    });

    expect(findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          nome: expect.anything(),
          status: 'encontrado',
          categoria: { id: 'uuid-categoria' },
          localEncontrado: { id: 'uuid-local' },
        },
      }),
    );
  });

  it('deve listar sem filtros quando nenhum for informado', async () => {
    findAndCount.mockResolvedValue([[], 0]);

    await service.listar({
      page: 1,
      limit: 10,
    });

    expect(findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        skip: 0,
        take: 10,
      }),
    );
  });
});