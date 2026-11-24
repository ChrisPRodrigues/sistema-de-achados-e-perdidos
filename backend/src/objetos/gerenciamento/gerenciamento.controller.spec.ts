import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GerenciamentoController } from './gerenciamento.controller.js';

describe('GerenciamentoController', () => {
  let controller: GerenciamentoController;

  const gerenciamentoService = {
    atualizar: vi.fn(),
    devolver: vi.fn(),
  };

  const dataEncontrado = new Date('2026-10-25T10:00:00.000Z');

  const objetoBase = {
    id: 1,
    nome: 'Celular',
    descricao: 'Celular encontrado na biblioteca',
    categoria: { id: 2 },
    localEncontrado: { id: 3 },
    usuario: { id: 2 },
    dataEncontrado,
    status: 'encontrado',
  };

  const respostaEsperada = (status: string, nome = 'Celular') => ({
    id: 1,
    nome,
    descricao: 'Celular encontrado na biblioteca',
    categoriaId: 2,
    localId: 3,
    usuarioId: 2,
    categoria: {
      id: 2,
      nome: undefined,
      descricao: undefined,
    },
    local: {
      id: 3,
      nome: undefined,
      descricao: undefined,
    },
    usuario: {
      id: 2,
      nome: undefined,
      email: undefined,
      tipo: undefined,
    },
    dataEncontrado,
    status,
  });

  beforeEach(() => {
    vi.clearAllMocks();

    controller = new GerenciamentoController(
      gerenciamentoService as any,
    );
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve chamar o serviço ao atualizar um objeto', async () => {
    const dados = { nome: 'Celular atualizado' };

    gerenciamentoService.atualizar.mockResolvedValue({
      ...objetoBase,
      ...dados,
    });

    const resultado = await controller.atualizar(1, dados);

    expect(gerenciamentoService.atualizar).toHaveBeenCalledWith(
      1,
      dados,
    );

    expect(resultado).toEqual(
      respostaEsperada('encontrado', 'Celular atualizado'),
    );
  });

  it('deve chamar o serviço ao devolver um objeto', async () => {
    gerenciamentoService.devolver.mockResolvedValue({
      ...objetoBase,
      status: 'devolvido',
    });

    const resultado = await controller.devolver(1, {
      usuarioId: 2,
      observacao: 'Entregue ao proprietário',
    });

    expect(gerenciamentoService.devolver).toHaveBeenCalledWith(
      1,
      2,
      'Entregue ao proprietário',
    );

    expect(resultado).toEqual(
      respostaEsperada('devolvido'),
    );
  });
});