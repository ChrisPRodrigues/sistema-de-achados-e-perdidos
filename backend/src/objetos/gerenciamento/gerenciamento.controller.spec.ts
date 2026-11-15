
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GerenciamentoController } from './gerenciamento.controller.js';

describe('GerenciamentoController', () => {
  let controller: GerenciamentoController;

  const gerenciamentoService = {
    atualizar: vi.fn(),
    devolver: vi.fn(),
  };

  const objetoId = '550e8400-e29b-41d4-a716-446655440001';
  const categoriaId = '550e8400-e29b-41d4-a716-446655440002';
  const localId = '550e8400-e29b-41d4-a716-446655440003';
  const usuarioId = '550e8400-e29b-41d4-a716-446655440004';

  const dataEncontrado = new Date('2026-10-25T10:00:00.000Z');

  const objetoBase = {
    id: objetoId,
    nome: 'Celular',
    descricao: 'Celular encontrado na biblioteca',
    categoria: {
      id: categoriaId,
      nome: 'Eletrônicos',
      descricao: 'Dispositivos eletrônicos',
    },
    localEncontrado: {
      id: localId,
      nome: 'Biblioteca',
      descricao: 'Biblioteca central',
    },
    usuario: {
      id: usuarioId,
      nome: 'Maria',
      email: 'maria@example.com',
      tipo: 'aluno',
    },
    dataEncontrado,
    status: 'encontrado',
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

  it('deve chamar o serviço ao atualizar um objeto', async () => {
    const dados = { nome: 'Celular atualizado' };

    gerenciamentoService.atualizar.mockResolvedValue({
      ...objetoBase,
      ...dados,
    });

    const resultado = await controller.atualizar(objetoId, dados);

    expect(gerenciamentoService.atualizar).toHaveBeenCalledWith(
      objetoId,
      dados,
    );

    expect(resultado).toEqual({
      id: objetoId,
      nome: 'Celular atualizado',
      descricao: 'Celular encontrado na biblioteca',
      categoriaId,
      localId,
      usuarioId,
      categoria: objetoBase.categoria,
      local: objetoBase.localEncontrado,
      usuario: objetoBase.usuario,
      dataEncontrado,
      status: 'encontrado',
    });
  });

  it('deve chamar o serviço ao devolver um objeto', async () => {
    gerenciamentoService.devolver.mockResolvedValue({
      ...objetoBase,
      status: 'devolvido',
    });

    const resultado = await controller.devolver(objetoId, {
      usuarioId,
      observacao: 'Entregue ao proprietário',
    });

    expect(gerenciamentoService.devolver).toHaveBeenCalledWith(
      objetoId,
      usuarioId,
      'Entregue ao proprietário',
    );

    expect(resultado).toEqual({
      id: objetoId,
      nome: 'Celular',
      descricao: 'Celular encontrado na biblioteca',
      categoriaId,
      localId,
      usuarioId,
      categoria: objetoBase.categoria,
      local: objetoBase.localEncontrado,
      usuario: objetoBase.usuario,
      dataEncontrado,
      status: 'devolvido',
    });
  });
});
