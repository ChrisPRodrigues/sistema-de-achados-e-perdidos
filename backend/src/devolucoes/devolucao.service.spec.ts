import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DevolucaoService } from './devolucao.service.js';

describe('DevolucaoService', () => {
  let service: DevolucaoService;

  const devolucoes = {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  };

  const objetos = {
    findOneBy: vi.fn(),
  };

  const usuarios = {
    findOneBy: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();

    service = new DevolucaoService(
      devolucoes as any,
      objetos as any,
      usuarios as any,
    );
  });

  it('deve lançar erro quando o objeto não existir', async () => {
    objetos.findOneBy.mockResolvedValue(null);

    await expect(
      service.adicionar({ objetoId: 1, usuarioId: 1 }),
    ).rejects.toThrow(NotFoundException);

    expect(usuarios.findOneBy).not.toHaveBeenCalled();
    expect(devolucoes.save).not.toHaveBeenCalled();
  });

  it('deve lançar erro quando o usuário não existir', async () => {
    objetos.findOneBy.mockResolvedValue({ id: 1 });
    usuarios.findOneBy.mockResolvedValue(null);

    await expect(
      service.adicionar({ objetoId: 1, usuarioId: 99 }),
    ).rejects.toThrow(NotFoundException);

    expect(devolucoes.save).not.toHaveBeenCalled();
  });

  it('deve impedir uma segunda devolução do mesmo objeto', async () => {
    objetos.findOneBy.mockResolvedValue({ id: 1 });
    usuarios.findOneBy.mockResolvedValue({ id: 1 });
    devolucoes.findOne.mockResolvedValue({ id: 10 });

    await expect(
      service.adicionar({ objetoId: 1, usuarioId: 1 }),
    ).rejects.toThrow(ConflictException);

    expect(devolucoes.save).not.toHaveBeenCalled();
  });

  it('deve registrar a devolução quando objeto e usuário existirem', async () => {
    const dataDevolucao = new Date();
    const objeto = { id: 1 };
    const usuario = { id: 2 };
    const registroSalvo = {
      id: 5,
      objeto,
      usuario,
      dataDevolucao,
    };

    objetos.findOneBy.mockResolvedValue(objeto);
    usuarios.findOneBy.mockResolvedValue(usuario);
    devolucoes.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(registroSalvo);
    devolucoes.create.mockReturnValue({ objeto, usuario });
    devolucoes.save.mockResolvedValue({ id: 5 });

    const resultado = await service.adicionar({
      objetoId: 1,
      usuarioId: 2,
    });

    expect(devolucoes.create).toHaveBeenCalledWith({ objeto, usuario });
    expect(devolucoes.save).toHaveBeenCalledOnce();
    expect(resultado).toEqual({
      id: 5,
      objetoId: 1,
      usuarioId: 2,
      dataDevolucao,
    });
  });
});
