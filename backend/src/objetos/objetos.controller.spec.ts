
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';

import { ObjetosController } from './objetos.controller.js';
import { ListarObjetosService } from './listar-objetos.service.js';

describe('ObjetosController', () => {
  let controller: ObjetosController;

  const listar = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [ObjetosController],
        providers: [
          {
            provide: ListarObjetosService,
            useValue: { listar },
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
      categoria: {
        id: 'uuid-categoria',
        nome: 'Acessórios',
        descricao: 'Objetos pessoais',
      },
      localEncontrado: {
        id: 'uuid-local',
        nome: 'Biblioteca',
        descricao: 'Biblioteca do campus',
      },
      usuario: {
        id: 'uuid-usuario',
        nome: 'Professor',
        email: 'professor@ifpe.edu.br',
        tipo: 'docente',
      },
      dataEncontrado,
      status: 'encontrado',
    };

    const query = {
      page: 2,
      limit: 10,
    };

    listar.mockResolvedValue({
      objetos: [objeto],
      total: 25,
    });

    const resultado = await controller.listar(query);

    expect(listar).toHaveBeenCalledWith(query);

    expect(resultado).toEqual({
      objetos: [
        {
          id: 'uuid-objeto',
          nome: 'Mochila',
          descricao: 'Mochila encontrada na biblioteca',
          categoriaId: 'uuid-categoria',
          localId: 'uuid-local',
          usuarioId: 'uuid-usuario',
          categoria: {
            id: 'uuid-categoria',
            nome: 'Acessórios',
            descricao: 'Objetos pessoais',
          },
          local: {
            id: 'uuid-local',
            nome: 'Biblioteca',
            descricao: 'Biblioteca do campus',
          },
          usuario: {
            id: 'uuid-usuario',
            nome: 'Professor',
            email: 'professor@ifpe.edu.br',
            tipo: 'docente',
          },
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
