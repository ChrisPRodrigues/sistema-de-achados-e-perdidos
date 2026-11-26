import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GerenciamentoController } from './gerenciamento.controller.js';

import type { UsuarioAutenticado } from '../../auth/decorators/usuario-atual.decorator.js';

describe('GerenciamentoController', () => {
  let controller: GerenciamentoController;

  const docente: UsuarioAutenticado = {
    sub: 'docente-1',
    tipo: 'docente',
  };

  const gerenciamentoService = {
    atualizar: vi.fn(),
    devolver: vi.fn(),
    remover: vi.fn(),
  };

  const dataEncontrado = new Date(
    '2026-10-25T10:00:00.000Z',
  );

  const objetoBase = {
    id: 'objeto-1',
    nome: 'Celular',
    descricao: 'Celular encontrado na biblioteca',
    categoria: { id: 'categoria-1' },
    localEncontrado: { id: 'local-1' },
    usuario: { id: docente.sub },
    dataEncontrado,
    status: 'encontrado',
  };

  beforeEach(() => {
    vi.resetAllMocks();

    controller = new GerenciamentoController(
      gerenciamentoService as any,
    );
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve encaminhar o usuário autenticado na atualização', async () => {
    const dados = {
      nome: 'Celular atualizado',
    };

    gerenciamentoService.atualizar.mockResolvedValue({
      ...objetoBase,
      ...dados,
    });

    const resultado = await controller.atualizar(
      'objeto-1',
      dados,
      docente,
    );

    expect(gerenciamentoService.atualizar)
      .toHaveBeenCalledWith(
        'objeto-1',
        dados,
        docente,
      );

    expect(resultado).toMatchObject({
      id: 'objeto-1',
      nome: 'Celular atualizado',
      usuarioId: docente.sub,
      status: 'encontrado',
    });
  });

  it('deve encaminhar o usuário autenticado na devolução', async () => {
    gerenciamentoService.devolver.mockResolvedValue({
      ...objetoBase,
      status: 'devolvido',
    });

    const resultado = await controller.devolver(
      'objeto-1',
      {
        observacao: 'Entregue ao proprietário',
      },
      docente,
    );

    expect(gerenciamentoService.devolver)
      .toHaveBeenCalledWith(
        'objeto-1',
        docente,
        'Entregue ao proprietário',
      );

    expect(resultado).toMatchObject({
      id: 'objeto-1',
      status: 'devolvido',
    });
  });

  it('deve encaminhar o usuário autenticado na exclusão', async () => {
    gerenciamentoService.remover.mockResolvedValue(
      undefined,
    );

    await controller.remover(
      'objeto-1',
      docente,
    );

    expect(gerenciamentoService.remover)
      .toHaveBeenCalledWith(
        'objeto-1',
        docente,
      );
  });
});