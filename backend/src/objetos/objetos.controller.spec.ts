import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ObjetosController } from './objetos.controller.js';
import { ObjetoEntity } from './entities/objeto.entity.js';

describe('ObjetosController', () => {
  let controller: ObjetosController;

  const findAndCount = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [ObjetosController],
        providers: [
          {
            provide: getRepositoryToken(ObjetoEntity),
            useValue: {
              findAndCount,
            },
          },
        ],
      }).compile();

    controller = module.get<ObjetosController>(
      ObjetosController,
    );
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve listar objetos com paginação e relacionamentos', async () => {
    const dataEncontrado = new Date('2026-11-06');

    const objeto = {
      id: 'uuid-objeto',
      nome: 'Mochila',
      descricao: 'Mochila encontrada na biblioteca',
      categoria: { id: 'uuid-categoria' },
      localEncontrado: { id: 'uuid-local' },
      usuario: { id: 'uuid-usuario' },
      dataEncontrado,
      status: 'encontrado',
    };

    findAndCount.mockResolvedValue([[objeto], 25]);

    const resultado = await controller.listar({
      page: 2,
      limit: 10,
    });

    expect(findAndCount).toHaveBeenCalledWith({
      relations: {
        categoria: true,
        localEncontrado: true,
        usuario: true,
      },
      relationLoadStrategy: 'join',
      skip: 10,
      take: 10,
      order: {
        id: 'ASC',
      },
    });

    expect(resultado).toEqual({
      objetos: [
        {
          id: 'uuid-objeto',
          nome: 'Mochila',
          descricao: 'Mochila encontrada na biblioteca',
          categoriaId: 'uuid-categoria',
          localId: 'uuid-local',
          usuarioId: 'uuid-usuario',
          dataEncontrado,
          status: 'encontrado',
        },
      ],
      total: 25,
      pagina: 2,
      limite: 10,
      totalPaginas: 3,
    });
  });
});