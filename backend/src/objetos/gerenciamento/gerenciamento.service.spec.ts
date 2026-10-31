
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { GerenciamentoService } from './gerenciamento.service.js';

describe('GerenciamentoService', () => {
  let service: GerenciamentoService;

  const objetosRepository = {
    findOne: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  };

  const categoriasRepository = {
    findOneBy: vi.fn(),
  };

  const locaisRepository = {
    findOneBy: vi.fn(),
  };

  const devolucoesRepository = {
    findOne: vi.fn(),
  };

  const devolucoesService = {
    adicionar: vi.fn(),
  };

  const comprovanteService = {
    listar: vi.fn(),
  };

  const historicoService = {
    listar: vi.fn(),
  };

  const objeto = {
    id: 1,
    nome: 'Objeto teste',
    descricao: 'Descrição',
    categoria: { id: 1 },
    localEncontrado: { id: 1 },
    usuario: { id: 2 },
    dataEncontrado: new Date(),
    status: 'devolvido',
  };

  beforeEach(() => {
    vi.resetAllMocks();

    objetosRepository.findOne.mockResolvedValue({ ...objeto });
    objetosRepository.delete.mockResolvedValue({ affected: 1 });

    devolucoesRepository.findOne.mockResolvedValue(null);

    devolucoesService.adicionar.mockResolvedValue({
      id: 10,
      objetoId: 1,
      usuarioId: 2,
    });

    comprovanteService.listar.mockReturnValue([]);
    historicoService.listar.mockReturnValue([]);

    service = new GerenciamentoService(
      objetosRepository as any,
      categoriasRepository as any,
      locaisRepository as any,
      devolucoesRepository as any,
      devolucoesService as any,
      comprovanteService as any,
      historicoService as any,
    );
  });

  // TESTES DE DEVOLUÇÃO

  it('deve repassar erro quando o objeto não existir', async () => {
    devolucoesService.adicionar.mockRejectedValue(
      new NotFoundException('Objeto não encontrado'),
    );

    await expect(
      service.devolver(99, 2),
    ).rejects.toThrow(NotFoundException);

    expect(objetosRepository.findOne).not.toHaveBeenCalled();
  });

  it('deve repassar erro de objeto já devolvido', async () => {
    devolucoesService.adicionar.mockRejectedValue(
      new ConflictException('Este objeto já foi devolvido'),
    );

    await expect(
      service.devolver(1, 2),
    ).rejects.toThrow(ConflictException);
  });

  it('deve repassar erro quando o usuário não existir', async () => {
    devolucoesService.adicionar.mockRejectedValue(
      new NotFoundException('Usuário não encontrado'),
    );

    await expect(
      service.devolver(1, 99),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve repassar erro quando o usuário for aluno', async () => {
    devolucoesService.adicionar.mockRejectedValue(
      new BadRequestException(
        'Somente docentes podem registrar devoluções',
      ),
    );

    await expect(
      service.devolver(1, 2),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve registrar a devolução e retornar o objeto atualizado', async () => {
    const resultado = await service.devolver(
      1,
      2,
      'Objeto entregue ao proprietário',
    );

    expect(devolucoesService.adicionar).toHaveBeenCalledWith({
      objetoId: 1,
      usuarioId: 2,
      observacao: 'Objeto entregue ao proprietário',
    });

    expect(objetosRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: {
        categoria: true,
        localEncontrado: true,
        usuario: true,
      },
    });

    expect(resultado).toMatchObject({
      id: 1,
      status: 'devolvido',
    });
  });

  // TESTES DE EXCLUSÃO

  it('deve excluir um objeto sem registros associados', async () => {
    await service.remover(1);

    expect(objetosRepository.delete).toHaveBeenCalledWith(1);
  });

  it('não deve excluir um objeto inexistente', async () => {
    objetosRepository.findOne.mockResolvedValue(null);

    await expect(
      service.remover(99),
    ).rejects.toThrow(NotFoundException);

    expect(objetosRepository.delete).not.toHaveBeenCalled();
  });

  it('não deve excluir um objeto que possui devolução', async () => {
    devolucoesRepository.findOne.mockResolvedValue({
      id: 10,
      objeto: { id: 1 },
    });

    await expect(
      service.remover(1),
    ).rejects.toThrow(ConflictException);

    expect(objetosRepository.delete).not.toHaveBeenCalled();
  });

  it('não deve excluir um objeto que possui comprovante', async () => {
    comprovanteService.listar.mockReturnValue([
      { id: 1, objetoId: 1 },
    ]);

    await expect(
      service.remover(1),
    ).rejects.toThrow(ConflictException);

    expect(objetosRepository.delete).not.toHaveBeenCalled();
  });

  it('não deve excluir um objeto que possui histórico', async () => {
    historicoService.listar.mockReturnValue([
      { id: 1, objetoId: 1 },
    ]);

    await expect(
      service.remover(1),
    ).rejects.toThrow(ConflictException);

    expect(objetosRepository.delete).not.toHaveBeenCalled();
  });
});
