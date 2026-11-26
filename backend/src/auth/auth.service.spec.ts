import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';

import { AuthService } from './auth.service.js';
import { UsuarioEntity } from '../usuarios/entities/usuario.entity.js';

describe('AuthService', () => {
  let service: AuthService;
  let signAsync: ReturnType<typeof vi.fn>;

  const usuario = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    nome: 'Aluno Teste',
    email: 'aluno@exemplo.com',
    tipo: 'aluno',
  } as UsuarioEntity;

  beforeEach(() => {
    signAsync = vi.fn().mockResolvedValue('token-teste');

    service = new AuthService(
      {} as Repository<UsuarioEntity>,
      { signAsync } as unknown as JwtService,
    );
  });

  it('deve aceitar uma senha correta', async () => {
    const senhaHash = await hash('Senha12345', 4);

    vi.spyOn(service, 'buscarUsuarioParaLogin')
      .mockResolvedValue({ ...usuario, senhaHash });

    const resultado = await service.validarCredenciais(
      usuario.email,
      'Senha12345',
    );

    expect(resultado.id).toBe(usuario.id);
  });

  it('deve rejeitar uma senha incorreta', async () => {
    const senhaHash = await hash('Senha12345', 4);

    vi.spyOn(service, 'buscarUsuarioParaLogin')
      .mockResolvedValue({ ...usuario, senhaHash });

    await expect(
      service.validarCredenciais(usuario.email, 'senhaErrada'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('deve rejeitar um usuário inexistente', async () => {
    vi.spyOn(service, 'buscarUsuarioParaLogin')
      .mockResolvedValue(null);

    await expect(
      service.validarCredenciais('inexistente@exemplo.com', 'Senha12345'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('deve gerar um JWT sem expor o hash da senha', async () => {
    vi.spyOn(service, 'validarCredenciais')
      .mockResolvedValue(usuario);

    const resultado = await service.login(
      usuario.email,
      'Senha12345',
    );

    expect(signAsync).toHaveBeenCalledWith({
      sub: usuario.id,
      tipo: 'aluno',
    });

    expect(resultado.access_token).toBe('token-teste');
    expect(resultado.usuario).not.toHaveProperty('senhaHash');
  });
});