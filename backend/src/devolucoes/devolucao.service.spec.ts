import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { DevolucaoService } from './devolucao.service.js';
import { DevolucaoEntity } from './entities/devolucao.entity.js';
import { ObjetoEntity } from '../objetos/entities/objeto.entity.js';
import { UsuarioEntity } from '../usuarios/entities/usuario.entity.js';

import type { UsuarioAutenticado } from '../auth/decorators/usuario-atual.decorator.js';

describe('DevolucaoService', () => {
  let service: DevolucaoService;

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

  const queryObjeto = {
    setLock: vi.fn(),
    where: vi.fn(),
    getOne: vi.fn(),
  };

  const repoObjeto = {
    createQueryBuilder: vi.fn(),
  };

  const repoUsuario = {
    findOneBy: vi.fn(),
  };

  const repoDevolucao = {
    findOne: vi.fn(),
    remove: vi.fn(),
  };

  const manager = {
    getRepository: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };

  const devolucoes = {
    manager: {
      transaction: vi.fn(),
    },
    find: vi.fn(),
    findOne: vi.fn(),
    save: vi.fn(),
  };

  function criarRegistro() {
    return {
      id: 'devolucao-1',
      objeto: { id: 'objeto-1' },
      usuario: { id: docente.sub },
      dataDevolucao: new Date(
        '2026-10-25T12:00:00Z',
      ),
      observacao: null,
    };
  }

  beforeEach(() => {
    vi.resetAllMocks();

    queryObjeto.setLock.mockReturnValue(queryObjeto);
    queryObjeto.where.mockReturnValue(queryObjeto);

    queryObjeto.getOne.mockResolvedValue({
      id: 'objeto-1',
      status: 'encontrado',
    });

    repoObjeto.createQueryBuilder.mockReturnValue(
      queryObjeto,
    );

    repoUsuario.findOneBy.mockResolvedValue({
      id: docente.sub,
      tipo: 'docente',
    });

    repoDevolucao.findOne.mockResolvedValue(null);

    manager.getRepository.mockImplementation(
      (entity) => {
        if (entity === ObjetoEntity) return repoObjeto;
        if (entity === UsuarioEntity) return repoUsuario;
        if (entity === DevolucaoEntity) return repoDevolucao;

        throw new Error('Entidade inesperada');
      },
    );

    manager.create.mockImplementation(
      (_entity, dados) => ({ ...dados }),
    );

    manager.save.mockImplementation(
      async (entity, dados) => {
        if (entity === DevolucaoEntity) {
          return {
            ...dados,
            id: 'devolucao-1',
          };
        }

        return dados;
      },
    );

    devolucoes.manager.transaction.mockImplementation(
      async (callback) => callback(manager),
    );

    devolucoes.findOne.mockResolvedValue(
      criarRegistro(),
    );

    devolucoes.find.mockResolvedValue([
      criarRegistro(),
    ]);

    service = new DevolucaoService(
      devolucoes as any,
    );
  });

  // TESTES DE CADASTRO

  it('deve lançar erro quando o objeto não existir', async () => {
    queryObjeto.getOne.mockResolvedValue(null);

    await expect(
      service.adicionar(
        { objetoId: 'inexistente' },
        docente,
      ),
    ).rejects.toThrow(NotFoundException);

    expect(manager.save).not.toHaveBeenCalled();
  });

  it('deve lançar erro quando o usuário não existir', async () => {
    repoUsuario.findOneBy.mockResolvedValue(null);

    await expect(
      service.adicionar(
        { objetoId: 'objeto-1' },
        docente,
      ),
    ).rejects.toThrow(NotFoundException);

    expect(manager.save).not.toHaveBeenCalled();
  });

  it('deve impedir uma segunda devolução do mesmo objeto', async () => {
    repoDevolucao.findOne.mockResolvedValue({
      id: 'devolucao-existente',
    });

    await expect(
      service.adicionar(
        { objetoId: 'objeto-1' },
        docente,
      ),
    ).rejects.toThrow(ConflictException);

    expect(manager.save).not.toHaveBeenCalled();
  });

  it('deve impedir devolução registrada por aluno', async () => {
    await expect(
      service.adicionar(
        { objetoId: 'objeto-1' },
        aluno,
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(manager.save).not.toHaveBeenCalled();

    expect(devolucoes.manager.transaction)
      .not.toHaveBeenCalled();
  });

  it('deve registrar devolução usando o usuário autenticado', async () => {
    const resultado = await service.adicionar(
      {
        objetoId: 'objeto-1',
        observacao: 'Objeto entregue ao proprietário',
      },
      docente,
    );

    expect(repoUsuario.findOneBy)
      .toHaveBeenCalledWith({
        id: docente.sub,
      });

    expect(devolucoes.manager.transaction)
      .toHaveBeenCalledOnce();

    expect(queryObjeto.setLock)
      .toHaveBeenCalledWith('pessimistic_write');

    expect(manager.save)
      .toHaveBeenCalledWith(
        ObjetoEntity,
        expect.objectContaining({
          status: 'devolvido',
        }),
      );

    expect(manager.create)
      .toHaveBeenCalledWith(
        DevolucaoEntity,
        expect.objectContaining({
          usuario: expect.objectContaining({
            id: docente.sub,
          }),
          observacao: 'Objeto entregue ao proprietário',
        }),
      );

    expect(manager.save)
      .toHaveBeenCalledWith(
        DevolucaoEntity,
        expect.any(Object),
      );

    expect(resultado.usuarioId).toBe(docente.sub);
  });

  it('deve impedir devolução se o usuário não for docente no banco', async () => {
    repoUsuario.findOneBy.mockResolvedValue({
      id: docente.sub,
      tipo: 'aluno',
    });

    await expect(
      service.adicionar(
        { objetoId: 'objeto-1' },
        docente,
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(manager.save).not.toHaveBeenCalled();
  });

  // TESTES DE AUTORIZAÇÃO E IDOR

  it('deve permitir consulta da própria devolução', async () => {
    const resultado = await service.buscarPorId(
      'devolucao-1',
      docente,
    );

    expect(resultado.usuarioId).toBe(docente.sub);
  });

  it('deve impedir consulta de devolução alheia', async () => {
    await expect(
      service.buscarPorId(
        'devolucao-1',
        outroDocente,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('deve impedir consulta de devolução por aluno', async () => {
    await expect(
      service.buscarPorId('devolucao-1', aluno),
    ).rejects.toThrow(ForbiddenException);
  });

  it('deve impedir alteração de devolução alheia', async () => {
    await expect(
      service.atualizar(
        'devolucao-1',
        { observacao: 'Alteração indevida' },
        outroDocente,
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(devolucoes.save).not.toHaveBeenCalled();
  });

  it('deve impedir exclusão de devolução alheia', async () => {
    repoDevolucao.findOne.mockResolvedValue(
      criarRegistro(),
    );

    await expect(
      service.remover(
        'devolucao-1',
        outroDocente,
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(repoDevolucao.remove)
      .not.toHaveBeenCalled();

    expect(manager.save).not.toHaveBeenCalled();
  });

  it('deve listar apenas devoluções do docente autenticado', async () => {
    await service.listar(docente);

    expect(devolucoes.find)
      .toHaveBeenCalledWith({
        where: {
          usuario: { id: docente.sub },
        },
        relations: {
          objeto: true,
          usuario: true,
        },
        order: { id: 'ASC' },
      });
  });

  it('deve impedir listagem de devoluções por aluno', async () => {
    await expect(
      service.listar(aluno),
    ).rejects.toThrow(ForbiddenException);

    expect(devolucoes.find).not.toHaveBeenCalled();
  });

  it('deve retornar 404 para devolução inexistente', async () => {
    devolucoes.findOne.mockResolvedValue(null);

    await expect(
      service.buscarPorId('inexistente', docente),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve permitir atualização da própria devolução', async () => {
    const registro = criarRegistro();

    devolucoes.findOne.mockResolvedValue(registro);

    const resultado = await service.atualizar(
      'devolucao-1',
      { observacao: 'Observação atualizada' },
      docente,
    );

    expect(devolucoes.save)
      .toHaveBeenCalledWith(
        expect.objectContaining({
          observacao: 'Observação atualizada',
        }),
      );

    expect(resultado.observacao)
      .toBe('Observação atualizada');
  });

  it('deve permitir exclusão da própria devolução', async () => {
    repoDevolucao.findOne.mockResolvedValue(
      criarRegistro(),
    );

    await service.remover(
      'devolucao-1',
      docente,
    );

    expect(repoDevolucao.remove)
      .toHaveBeenCalledOnce();

    expect(manager.save)
      .toHaveBeenCalledWith(
        ObjetoEntity,
        expect.objectContaining({
          status: 'encontrado',
        }),
      );
  });
});