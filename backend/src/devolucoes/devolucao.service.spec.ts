
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DevolucaoService } from './devolucao.service.js';

describe('DevolucaoService', () => {
  let service: DevolucaoService;

  const devolucaoRepository = {
    listar: vi.fn(),
    buscarPorId: vi.fn(),
    adicionar: vi.fn(),
    atualizar: vi.fn(),
    remover: vi.fn(),
  };

  const objetosRepository = {
    buscarPorId: vi.fn(),
    atualizar: vi.fn(),
  };

  const usuariosService = {
    buscarPorId: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    service = new DevolucaoService(
      devolucaoRepository as any,
      objetosRepository as any,
      usuariosService as any,
    );
  });

  it('deve lançar erro quando o objeto não existir', () => {
    objetosRepository.buscarPorId.mockReturnValue(undefined);

    expect(() =>
      service.adicionar({
        objetoId: 1,
        usuarioId: 1,
        observacao: 'Teste',
      }),
    ).toThrow(NotFoundException);

    expect(devolucaoRepository.adicionar).not.toHaveBeenCalled();
  });

  it('deve lançar erro quando o usuário não existir', () => {
    objetosRepository.buscarPorId.mockReturnValue({
      id: 1,
      status: 'encontrado',
    });

    usuariosService.buscarPorId.mockReturnValue(undefined);

    expect(() =>
      service.adicionar({
        objetoId: 1,
        usuarioId: 99,
        observacao: 'Teste',
      }),
    ).toThrow(NotFoundException);

    expect(devolucaoRepository.adicionar).not.toHaveBeenCalled();
  });

  it('deve registrar a devolução quando o objeto e o usuário existirem', () => {
    objetosRepository.buscarPorId.mockReturnValue({
      id: 1,
      status: 'encontrado',
    });

    usuariosService.buscarPorId.mockReturnValue({ id: 1 });

    objetosRepository.atualizar.mockReturnValue({
      id: 1,
      status: 'devolvido',
    });

    devolucaoRepository.adicionar.mockImplementation((dados) => ({
      id: 1,
      ...dados,
    }));

    const resultado = service.adicionar({
      objetoId: 1,
      usuarioId: 1,
      observacao: 'Devolução de teste',
    });

    expect(objetosRepository.atualizar).toHaveBeenCalledWith(1, {
      status: 'devolvido',
    });
    expect(devolucaoRepository.adicionar).toHaveBeenCalledOnce();
    expect(resultado.id).toBe(1);
    expect(resultado.dataDevolucao).toBeInstanceOf(Date);
    expect(resultado.observacao).toBe('Devolução de teste');
  });

  it('deve impedir devolução de objeto já devolvido', () => {
    objetosRepository.buscarPorId.mockReturnValue({
      id: 1,
      status: 'devolvido',
    });

    expect(() =>
      service.adicionar({
        objetoId: 1,
        usuarioId: 1,
        observacao: 'Tentativa duplicada',
      }),
    ).toThrow('Este objeto já foi devolvido');

    expect(usuariosService.buscarPorId).not.toHaveBeenCalled();
    expect(objetosRepository.atualizar).not.toHaveBeenCalled();
    expect(devolucaoRepository.adicionar).not.toHaveBeenCalled();
  });
});
