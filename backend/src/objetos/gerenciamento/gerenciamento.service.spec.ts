import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { GerenciamentoService } from './gerenciamento.service.js';
import { ObjetoEntity } from '../entities/objeto.entity.js';
import { DevolucaoEntity } from '../../devolucoes/entities/devolucao.entity.js';

describe('GerenciamentoService', () => {
  let service: GerenciamentoService;

  const objetosRepository = {
    findOne: vi.fn(),
    save: vi.fn(),
  };

  const categoriasRepository = {
    findOneBy: vi.fn(),
  };

  const locaisRepository = {
    findOneBy: vi.fn(),
  };

  const usuariosRepository = {
    findOneBy: vi.fn(),
  };

  const manager = {
    save: vi.fn(),
    create: vi.fn(),
  };

  const devolucoesRepository = {
    manager: {
      transaction: vi.fn(),
    },
  };

  const objeto = {
    id: 1,
    nome: 'Objeto teste',
    descricao: 'Descrição',
    categoria: { id: 1 },
    localEncontrado: { id: 1 },
    usuario: { id: 2 },
    dataEncontrado: new Date(),
    status: 'encontrado',
  };

  beforeEach(() => {
    vi.resetAllMocks();

    objetosRepository.findOne.mockResolvedValue({ ...objeto });
    usuariosRepository.findOneBy.mockResolvedValue({
      id: 2,
      tipo: 'docente',
    });

    devolucoesRepository.manager.transaction.mockImplementation(
      async (callback) => callback(manager),
    );

    manager.save.mockResolvedValue({});
    manager.create.mockReturnValue({ id: 1 });

    service = new GerenciamentoService(
      objetosRepository as any,
      categoriasRepository as any,
      locaisRepository as any,
      usuariosRepository as any,
      devolucoesRepository as any,
    );
  });

  it('deve lançar erro quando o objeto não existir', async () => {
    objetosRepository.findOne.mockResolvedValue(null);

    await expect(service.devolver(1, 2)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve impedir a devolução de um objeto já devolvido', async () => {
    objetosRepository.findOne.mockResolvedValue({
      ...objeto,
      status: 'devolvido',
    });

    await expect(service.devolver(1, 2)).rejects.toThrow(
      ConflictException,
    );

    expect(devolucoesRepository.manager.transaction).not.toHaveBeenCalled();
  });

  it('deve lançar erro quando o usuário não existir', async () => {
    usuariosRepository.findOneBy.mockResolvedValue(null);

    await expect(service.devolver(1, 99)).rejects.toThrow(
      NotFoundException,
    );

    expect(devolucoesRepository.manager.transaction).not.toHaveBeenCalled();
  });

  it('deve impedir devolução registrada por aluno', async () => {
    usuariosRepository.findOneBy.mockResolvedValue({
      id: 2,
      tipo: 'aluno',
    });

    await expect(service.devolver(1, 2)).rejects.toThrow(
      BadRequestException,
    );

    expect(devolucoesRepository.manager.transaction).not.toHaveBeenCalled();
  });

  it('deve registrar a devolução e atualizar o status do objeto', async () => {
    await service.devolver(1, 2, 'Devolvido ao proprietário');

    expect(devolucoesRepository.manager.transaction).toHaveBeenCalledOnce();
    expect(manager.save).toHaveBeenCalledWith(
      ObjetoEntity,
      expect.objectContaining({ status: 'devolvido' }),
    );
    expect(manager.create).toHaveBeenCalledWith(
      DevolucaoEntity,
      expect.objectContaining({
        objeto: expect.objectContaining({ id: 1 }),
        usuario: expect.objectContaining({ id: 2 }),
      }),
    );
  });
});
