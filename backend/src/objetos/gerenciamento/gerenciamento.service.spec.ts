import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { GerenciamentoService } from './gerenciamento.service.js';

import type { UsuarioAutenticado } from '../../auth/decorators/usuario-atual.decorator.js';

describe('GerenciamentoService', () => {
  let service: GerenciamentoService;

  const docente: UsuarioAutenticado = {
    sub: 'docente-1',
    tipo: 'docente',
  };

  const outroDocente: UsuarioAutenticado = {
    sub: 'docente-2',
    tipo: 'docente',
  };

  const aluno: UsuarioAutenticado = {
    sub: 'aluno-1',
    tipo: 'aluno',
  };

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
    id: 'objeto-1',
    nome: 'Objeto teste',
    descricao: 'Descrição',
    categoria: { id: 'categoria-1' },
    localEncontrado: { id: 'local-1' },
    usuario: { id: docente.sub },
    dataEncontrado: new Date(),
    status: 'devolvido',
  };

  beforeEach(() => {
    vi.resetAllMocks();

    objetosRepository.findOne.mockResolvedValue({
      ...objeto,
    });

    objetosRepository.delete.mockResolvedValue({
      affected: 1,
    });

    devolucoesRepository.findOne.mockResolvedValue(null);

    devolucoesService.adicionar.mockResolvedValue({
      id: 'devolucao-1',
      objetoId: 'objeto-1',
      usuarioId: docente.sub,
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
      service.devolver('inexistente', docente),
    ).rejects.toThrow(NotFoundException);

    expect(objetosRepository.findOne)
      .not.toHaveBeenCalled();
  });

  it('deve repassar erro de objeto já devolvido', async () => {
    devolucoesService.adicionar.mockRejectedValue(
      new ConflictException('Este objeto já foi devolvido'),
    );

    await expect(
      service.devolver('objeto-1', docente),
    ).rejects.toThrow(ConflictException);
  });

  it('deve repassar erro quando o usuário não existir', async () => {
    devolucoesService.adicionar.mockRejectedValue(
      new NotFoundException('Usuário não encontrado'),
    );

    await expect(
      service.devolver('objeto-1', docente),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve impedir devolução realizada por aluno', async () => {
    await expect(
      service.devolver('objeto-1', aluno),
    ).rejects.toThrow(ForbiddenException);

    expect(devolucoesService.adicionar)
      .not.toHaveBeenCalled();
  });

  it('deve registrar devolução usando o usuário autenticado', async () => {
    const resultado = await service.devolver(
      'objeto-1',
      docente,
      'Objeto entregue ao proprietário',
    );

    expect(devolucoesService.adicionar)
      .toHaveBeenCalledWith(
        {
          objetoId: 'objeto-1',
          observacao: 'Objeto entregue ao proprietário',
        },
        docente,
      );

    expect(objetosRepository.findOne)
      .toHaveBeenCalledWith({
        where: { id: 'objeto-1' },
        relations: {
          categoria: true,
          localEncontrado: true,
          usuario: true,
        },
      });

    expect(resultado.status).toBe('devolvido');
  });

  // TESTES DE EXCLUSÃO

  it('deve excluir o próprio objeto sem registros associados', async () => {
    await service.remover('objeto-1', docente);

    expect(objetosRepository.delete)
      .toHaveBeenCalledWith('objeto-1');
  });

  it('não deve excluir um objeto inexistente', async () => {
    objetosRepository.findOne.mockResolvedValue(null);

    await expect(
      service.remover('inexistente', docente),
    ).rejects.toThrow(NotFoundException);

    expect(objetosRepository.delete)
      .not.toHaveBeenCalled();
  });

  it('não deve excluir objeto que possui devolução', async () => {
    devolucoesRepository.findOne.mockResolvedValue({
      id: 'devolucao-1',
    });

    await expect(
      service.remover('objeto-1', docente),
    ).rejects.toThrow(ConflictException);

    expect(objetosRepository.delete)
      .not.toHaveBeenCalled();
  });

  it('não deve excluir objeto que possui comprovante', async () => {
    comprovanteService.listar.mockReturnValue([
      { id: 'comprovante-1', objetoId: 'objeto-1' },
    ]);

    await expect(
      service.remover('objeto-1', docente),
    ).rejects.toThrow(ConflictException);

    expect(objetosRepository.delete)
      .not.toHaveBeenCalled();
  });

  it('não deve excluir objeto que possui histórico', async () => {
    historicoService.listar.mockReturnValue([
      { id: 'historico-1', objetoId: 'objeto-1' },
    ]);

    await expect(
      service.remover('objeto-1', docente),
    ).rejects.toThrow(ConflictException);

    expect(objetosRepository.delete)
      .not.toHaveBeenCalled();
  });

  // TESTES DE AUTORIZAÇÃO E IDOR

  it('deve impedir exclusão de objeto de outro docente', async () => {
    await expect(
      service.remover('objeto-1', outroDocente),
    ).rejects.toThrow(ForbiddenException);

    expect(objetosRepository.delete)
      .not.toHaveBeenCalled();
  });

  it('deve impedir exclusão de objeto por aluno', async () => {
    await expect(
      service.remover('objeto-1', aluno),
    ).rejects.toThrow(ForbiddenException);

    expect(objetosRepository.delete)
      .not.toHaveBeenCalled();
  });

  it('deve permitir atualização do próprio objeto', async () => {
    const resultado = await service.atualizar(
      'objeto-1',
      { nome: 'Objeto atualizado' },
      docente,
    );

    expect(objetosRepository.save)
      .toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'Objeto atualizado',
        }),
      );

    expect(resultado.nome).toBe('Objeto atualizado');
  });

  it('deve impedir atualização de objeto de outro docente', async () => {
    await expect(
      service.atualizar(
        'objeto-1',
        { nome: 'Alteração indevida' },
        outroDocente,
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(objetosRepository.save)
      .not.toHaveBeenCalled();
  });

  it('deve impedir atualização de objeto por aluno', async () => {
    await expect(
      service.atualizar(
        'objeto-1',
        { nome: 'Alteração indevida' },
        aluno,
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(objetosRepository.save)
      .not.toHaveBeenCalled();
  });
});