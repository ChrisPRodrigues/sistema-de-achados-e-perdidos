import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { CadastroService } from './cadastro.service.js';

import type { UsuarioAutenticado } from '../../auth/decorators/usuario-atual.decorator.js';

describe('CadastroService', () => {
  let service: CadastroService;

  const docente: UsuarioAutenticado = {
    sub: 'docente-1',
    tipo: 'docente',
  };

  const aluno: UsuarioAutenticado = {
    sub: 'aluno-1',
    tipo: 'aluno',
  };

  const objetosRepository = {
    create: vi.fn(),
    save: vi.fn(),
    findOne: vi.fn(),
  };

  const categoriasRepository = {
    findOneBy: vi.fn(),
  };

  const locaisRepository = {
    findOneBy: vi.fn(),
  };

  const usuariosRepository = {
    findOneBy: vi.fn(),
  };

  const dados = {
    nome: 'Mochila',
    descricao: 'Mochila encontrada na biblioteca',
    categoriaId: 'categoria-1',
    localId: 'local-1',
    dataEncontrado: new Date('2026-11-26'),
  };

  beforeEach(() => {
    vi.resetAllMocks();

    usuariosRepository.findOneBy.mockResolvedValue({
      id: docente.sub,
      tipo: 'docente',
    });

    categoriasRepository.findOneBy.mockResolvedValue({
      id: 'categoria-1',
    });

    locaisRepository.findOneBy.mockResolvedValue({
      id: 'local-1',
    });

    objetosRepository.create.mockImplementation(
      (objeto) => objeto,
    );

    objetosRepository.save.mockImplementation(
      async (objeto) => ({
        ...objeto,
        id: 'objeto-1',
      }),
    );

    service = new CadastroService(
      objetosRepository as any,
      categoriasRepository as any,
      locaisRepository as any,
      usuariosRepository as any,
    );
  });

  it('deve cadastrar objeto usando o usuário autenticado', async () => {
    const resultado = await service.cadastrar(
      dados,
      docente,
    );

    expect(usuariosRepository.findOneBy)
      .toHaveBeenCalledWith({
        id: docente.sub,
      });

    expect(objetosRepository.create)
      .toHaveBeenCalledWith(
        expect.objectContaining({
          usuario: expect.objectContaining({
            id: docente.sub,
          }),
          status: 'encontrado',
        }),
      );

    expect(resultado.usuario.id).toBe(docente.sub);
  });

  it('deve impedir cadastro de objeto por aluno', async () => {
    await expect(
      service.cadastrar(dados, aluno),
    ).rejects.toThrow(ForbiddenException);

    expect(objetosRepository.save)
      .not.toHaveBeenCalled();
  });

  it('deve impedir cadastro quando o usuário não existir', async () => {
    usuariosRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.cadastrar(dados, docente),
    ).rejects.toThrow(NotFoundException);

    expect(objetosRepository.save)
      .not.toHaveBeenCalled();
  });

  it('deve impedir cadastro quando o usuário não for docente no banco', async () => {
    usuariosRepository.findOneBy.mockResolvedValue({
      id: docente.sub,
      tipo: 'aluno',
    });

    await expect(
      service.cadastrar(dados, docente),
    ).rejects.toThrow(ForbiddenException);

    expect(objetosRepository.save)
      .not.toHaveBeenCalled();
  });

  it('deve ignorar tentativa de falsificar o proprietário', async () => {
    const dadosAdulterados = {
      ...dados,
      usuarioId: 'outro-docente',
    };

    const resultado = await service.cadastrar(
      dadosAdulterados,
      docente,
    );

    expect(usuariosRepository.findOneBy)
      .toHaveBeenCalledWith({
        id: docente.sub,
      });

    expect(resultado.usuario.id).toBe(docente.sub);
  });

  it('deve retornar erro quando a categoria não existir', async () => {
    categoriasRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.cadastrar(dados, docente),
    ).rejects.toThrow(NotFoundException);

    expect(objetosRepository.save)
      .not.toHaveBeenCalled();
  });

  it('deve retornar erro quando o local não existir', async () => {
    locaisRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.cadastrar(dados, docente),
    ).rejects.toThrow(NotFoundException);

    expect(objetosRepository.save)
      .not.toHaveBeenCalled();
  });
});