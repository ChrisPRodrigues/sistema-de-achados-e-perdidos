import { describe, expect, it, vi } from 'vitest';
import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { QueryFailedError, Repository } from 'typeorm';

import { AuthService } from './auth.service.js';
import { UsuarioEntity } from '../usuarios/entities/usuario.entity.js';

describe('AuthService - Cadastro', () => {
  const dados = {
    nome: 'Maria Silva',
    email: 'MARIA@EXEMPLO.COM',
    senha: 'SenhaSegura123',
  };

  function criarMocks() {
    const getOne = vi.fn().mockResolvedValue(null);

    const create = vi.fn((valores: Partial<UsuarioEntity>) => ({
      id: '550e8400-e29b-41d4-a716-446655440000',
      ...valores,
    } as UsuarioEntity));

    const save = vi.fn(async (usuario: UsuarioEntity) => usuario);

    const repository = {
      createQueryBuilder: vi.fn(() => ({
        where: vi.fn().mockReturnThis(),
        getOne,
      })),
      create,
      save,
    } as unknown as Repository<UsuarioEntity>;

    const service = new AuthService(
      repository,
      {} as JwtService,
    );

    return { service, getOne, create, save };
  }

  it('deve cadastrar usuários somente como aluno', async () => {
    const { service, create } = criarMocks();

    const dadosMaliciosos = {
      ...dados,
      tipo: 'docente',
    };

    const resultado = await service.cadastrar(dadosMaliciosos);

    expect(resultado.tipo).toBe('aluno');
    expect(resultado.email).toBe('maria@exemplo.com');

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: 'aluno',
      }),
    );
  });

  it('deve armazenar a senha como hash bcrypt', async () => {
    const { service, create } = criarMocks();

    await service.cadastrar(dados);

    const usuarioCriado = create.mock.calls[0][0];
    const senhaHash = usuarioCriado.senhaHash;

    expect(senhaHash).toBeDefined();
    expect(senhaHash).not.toBe(dados.senha);
    expect(await compare(dados.senha, senhaHash!)).toBe(true);
  });

  it('deve rejeitar e-mail já cadastrado', async () => {
    const { service, getOne } = criarMocks();

    getOne.mockResolvedValue({
      id: 'usuario-existente',
    });

    await expect(
      service.cadastrar(dados),
    ).rejects.toThrow(ConflictException);
  });

  it('deve tratar conflito de e-mail no banco', async () => {
    const { service, save } = criarMocks();

    const erro = new QueryFailedError(
      'INSERT INTO usuarios',
      [],
      Object.assign(new Error('Duplicado'), {
        code: '23505',
      }),
    );

    save.mockRejectedValue(erro);

    await expect(
      service.cadastrar(dados),
    ).rejects.toThrow(ConflictException);
  });
});