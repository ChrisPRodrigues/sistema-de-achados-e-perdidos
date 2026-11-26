import 'reflect-metadata';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import type { Repository } from 'typeorm';

import { SolicitacaoService } from './solicitacao.service.js';
import { SolicitacaoEntity } from './entities/solicitacao.entity.js';
import { UsuarioEntity } from '../usuarios/entities/usuario.entity.js';
import { ObjetoEntity } from '../objetos/entities/objeto.entity.js';

import type { UsuarioAutenticado } from '../auth/decorators/usuario-atual.decorator.js';

describe('SolicitacaoService - Autorização e IDOR', () => {
  let service: SolicitacaoService;

  const aluno: UsuarioAutenticado = {
    sub: 'aluno-1',
    tipo: 'aluno',
  };

  const outroAluno: UsuarioAutenticado = {
    sub: 'aluno-2',
    tipo: 'aluno',
  };

  const docente: UsuarioAutenticado = {
    sub: 'docente-1',
    tipo: 'docente',
  };

  const solicitacoesRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  };

  const usuariosRepository = {
    findOneBy: vi.fn(),
  };

  const objetosRepository = {
    findOneBy: vi.fn(),
  };

  function criarSolicitacao() {
    return {
      id: 'solicitacao-1',
      usuario: { id: 'aluno-1' },
      objeto: { id: 'objeto-1' },
      status: 'pendente',
    };
  }

  beforeEach(() => {
    vi.resetAllMocks();

    service = new SolicitacaoService(
      solicitacoesRepository as unknown as
        Repository<SolicitacaoEntity>,

      usuariosRepository as unknown as
        Repository<UsuarioEntity>,

      objetosRepository as unknown as
        Repository<ObjetoEntity>,
    );
  });

  it('deve permitir consultar a própria solicitação', async () => {
    solicitacoesRepository.findOne.mockResolvedValue(
      criarSolicitacao(),
    );

    const resultado = await service.buscarPorId(
      'solicitacao-1',
      aluno,
    );

    expect(resultado.usuarioId).toBe(aluno.sub);
  });

  it('deve impedir consulta de solicitação alheia', async () => {
    solicitacoesRepository.findOne.mockResolvedValue(
      criarSolicitacao(),
    );

    await expect(
      service.buscarPorId('solicitacao-1', outroAluno),
    ).rejects.toThrow(ForbiddenException);
  });

  it('deve impedir alteração de solicitação alheia', async () => {
    solicitacoesRepository.findOne.mockResolvedValue(
      criarSolicitacao(),
    );

    await expect(
      service.atualizar(
        'solicitacao-1',
        { objetoId: 'objeto-2' },
        outroAluno,
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(solicitacoesRepository.save)
      .not.toHaveBeenCalled();
  });

  it('deve impedir exclusão de solicitação alheia', async () => {
    solicitacoesRepository.findOne.mockResolvedValue(
      criarSolicitacao(),
    );

    await expect(
      service.remover('solicitacao-1', outroAluno),
    ).rejects.toThrow(ForbiddenException);

    expect(solicitacoesRepository.delete)
      .not.toHaveBeenCalled();
  });

  it('deve impedir que o aluno aprove sua solicitação', async () => {
    solicitacoesRepository.findOne.mockResolvedValue(
      criarSolicitacao(),
    );

    await expect(
      service.atualizar(
        'solicitacao-1',
        { status: 'aprovada' },
        aluno,
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(solicitacoesRepository.save)
      .not.toHaveBeenCalled();
  });

  it('deve permitir que o docente consulte uma solicitação', async () => {
    solicitacoesRepository.findOne.mockResolvedValue(
      criarSolicitacao(),
    );

    const resultado = await service.buscarPorId(
      'solicitacao-1',
      docente,
    );

    expect(resultado.id).toBe('solicitacao-1');
  });

  it('deve retornar 404 para solicitação inexistente', async () => {
    solicitacoesRepository.findOne.mockResolvedValue(null);

    await expect(
      service.buscarPorId('inexistente', aluno),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve filtrar solicitações pelo aluno autenticado', async () => {
    solicitacoesRepository.find.mockResolvedValue([
      criarSolicitacao(),
    ]);

    await service.listar(aluno);

    expect(solicitacoesRepository.find)
      .toHaveBeenCalledWith({
        where: {
          usuario: { id: aluno.sub },
        },
        relations: {
          usuario: true,
          objeto: true,
        },
      });
  });

  it('deve permitir que o docente liste todas as solicitações', async () => {
    solicitacoesRepository.find.mockResolvedValue([]);

    await service.listar(docente);

    expect(solicitacoesRepository.find)
      .toHaveBeenCalledWith({
        where: {},
        relations: {
          usuario: true,
          objeto: true,
        },
      });
  });

  it('deve criar solicitação usando o usuário autenticado', async () => {
    const usuario = { id: aluno.sub };
    const objeto = { id: 'objeto-1' };

    usuariosRepository.findOneBy.mockResolvedValue(usuario);
    objetosRepository.findOneBy.mockResolvedValue(objeto);
    solicitacoesRepository.findOne.mockResolvedValue(null);

    solicitacoesRepository.create.mockReturnValue(
      criarSolicitacao(),
    );

    solicitacoesRepository.save.mockResolvedValue(
      criarSolicitacao(),
    );

    const resultado = await service.cadastrar(
      { objetoId: 'objeto-1' },
      aluno,
    );

    expect(usuariosRepository.findOneBy)
      .toHaveBeenCalledWith({ id: aluno.sub });

    expect(solicitacoesRepository.create)
      .toHaveBeenCalledWith({
        usuario,
        objeto,
        status: 'pendente',
      });

    expect(resultado.usuarioId).toBe(aluno.sub);
    expect(resultado.status).toBe('pendente');
  });

  it('deve permitir excluir a própria solicitação pendente', async () => {
    solicitacoesRepository.findOne.mockResolvedValue(
      criarSolicitacao(),
    );

    solicitacoesRepository.delete.mockResolvedValue({
      affected: 1,
    });

    await service.remover('solicitacao-1', aluno);

    expect(solicitacoesRepository.delete)
      .toHaveBeenCalledWith('solicitacao-1');
  });

  it('deve permitir que o docente aprove uma solicitação', async () => {
    solicitacoesRepository.findOne.mockResolvedValue(
      criarSolicitacao(),
    );

    solicitacoesRepository.save.mockImplementation(
      async (entidade) => entidade,
    );

    const resultado = await service.atualizar(
      'solicitacao-1',
      { status: 'aprovada' },
      docente,
    );

    expect(resultado.status).toBe('aprovada');
  });

  it('deve impedir exclusão de solicitação aprovada pelo aluno', async () => {
    solicitacoesRepository.findOne.mockResolvedValue({
      ...criarSolicitacao(),
      status: 'aprovada',
    });

    await expect(
      service.remover('solicitacao-1', aluno),
    ).rejects.toThrow(ForbiddenException);

    expect(solicitacoesRepository.delete)
      .not.toHaveBeenCalled();
  });
});