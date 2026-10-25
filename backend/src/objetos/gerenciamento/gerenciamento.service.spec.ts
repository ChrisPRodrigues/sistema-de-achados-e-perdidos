
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { GerenciamentoService } from './gerenciamento.service.js';

describe('GerenciamentoService', () => {
  let service: GerenciamentoService;

  const objetosRepository = {
    buscarPorId: vi.fn(),
    atualizar: vi.fn(),
  };

  const devolucaoRepository = {
    adicionar: vi.fn(),
  };

  const usuariosService = {
    buscarPorId: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    service = new GerenciamentoService(
      objetosRepository as any,
      devolucaoRepository as any,
      usuariosService as any,
    );
  });

  it('deve lançar erro quando o objeto não existir', () => {
    objetosRepository.buscarPorId.mockReturnValue(undefined);

    expect(() => service.devolver(1, 1)).toThrow(
      NotFoundException,
    );

    expect(devolucaoRepository.adicionar).not.toHaveBeenCalled();
  });

  it('deve impedir a devolução de um objeto já devolvido', () => {
    objetosRepository.buscarPorId.mockReturnValue({
      id: 1,
      status: 'devolvido',
    });

    expect(() => service.devolver(1, 1)).toThrow(
      NotFoundException,
    );

    expect(devolucaoRepository.adicionar).not.toHaveBeenCalled();
  });

  it('deve lançar erro quando o usuário não existir', () => {
    objetosRepository.buscarPorId.mockReturnValue({
      id: 1,
      status: 'encontrado',
    });

    usuariosService.buscarPorId.mockReturnValue(undefined);

    expect(() => service.devolver(1, 99)).toThrow(
      NotFoundException,
    );

    expect(devolucaoRepository.adicionar).not.toHaveBeenCalled();
  });

  it('deve registrar a devolução e atualizar o status do objeto', () => {
    objetosRepository.buscarPorId.mockReturnValue({
      id: 1,
      status: 'encontrado',
    });

    usuariosService.buscarPorId.mockReturnValue({
      id: 1,
    });

    objetosRepository.atualizar.mockReturnValue({
      id: 1,
      status: 'devolvido',
    });

    const resultado = service.devolver(
      1,
      1,
      'Devolvido ao proprietário',
    );

    expect(devolucaoRepository.adicionar).toHaveBeenCalledWith({
      objetoId: 1,
      usuarioId: 1,
      dataDevolucao: expect.any(Date),
      observacao: 'Devolvido ao proprietário',
    });

    expect(objetosRepository.atualizar).toHaveBeenCalledWith(1, {
      status: 'devolvido',
    });

    expect(resultado.status).toBe('devolvido');
  });

  it('deve lançar erro se não conseguir atualizar o objeto', () => {
    objetosRepository.buscarPorId.mockReturnValue({
      id: 1,
      status: 'encontrado',
    });

    usuariosService.buscarPorId.mockReturnValue({ id: 1 });
    objetosRepository.atualizar.mockReturnValue(undefined);

    expect(() => service.devolver(1, 1)).toThrow(
      'Não foi possível atualizar o objeto',
    );

    expect(devolucaoRepository.adicionar).not.toHaveBeenCalled();
  });
});
