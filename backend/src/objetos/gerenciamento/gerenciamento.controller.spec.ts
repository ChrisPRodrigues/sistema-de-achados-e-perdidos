
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GerenciamentoController } from './gerenciamento.controller.js';

describe('GerenciamentoController', () => {
  let controller: GerenciamentoController;

  const gerenciamentoService = {
    atualizar: vi.fn(),
    devolver: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    controller = new GerenciamentoController(
      gerenciamentoService as any,
    );
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve chamar o serviço ao atualizar um objeto', () => {
    const dados = { nome: 'Celular atualizado' };

    gerenciamentoService.atualizar.mockReturnValue({
      id: 1,
      ...dados,
    });

    const resultado = controller.atualizar(1, dados);

    expect(gerenciamentoService.atualizar).toHaveBeenCalledWith(
      1,
      dados,
    );
    expect(resultado).toEqual({
      id: 1,
      nome: 'Celular atualizado',
    });
  });

  it('deve chamar o serviço ao devolver um objeto', () => {
    gerenciamentoService.devolver.mockReturnValue({
      id: 1,
      status: 'devolvido',
    });

    const resultado = controller.devolver(1, {
      usuarioId: 2,
      observacao: 'Entregue ao proprietário',
    });

    expect(gerenciamentoService.devolver).toHaveBeenCalledWith(
      1,
      2,
      'Entregue ao proprietário',
    );
    expect(resultado).toEqual({
      id: 1,
      status: 'devolvido',
    });
  });
});
