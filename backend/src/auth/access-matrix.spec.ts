
import { describe, expect, it } from 'vitest';
import { RequestMethod } from '@nestjs/common';
import {
  GUARDS_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';

import { AuthController } from './auth.controller.js';
import { SolicitacaoController } from '../solicitacoes/solicitacao.controller.js';
import { GerenciamentoController } from '../objetos/gerenciamento/gerenciamento.controller.js';
import { UsuariosController } from '../usuarios/usuarios.controller.js';

import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { ROLES_KEY } from './decorators/roles.decorator.js';

describe('Matriz de acesso das rotas', () => {
  function obterRotas(controller: any) {
    return Object.getOwnPropertyNames(controller.prototype)
      .filter((nome) => nome !== 'constructor')
      .map((nome) => {
        const handler = controller.prototype[nome];

        return {
          nome,
          caminho: Reflect.getMetadata(PATH_METADATA, handler),
          metodo: Reflect.getMetadata(METHOD_METADATA, handler),
          guards: Reflect.getMetadata(GUARDS_METADATA, handler) ?? [],
        };
      })
      .filter((rota) => rota.caminho !== undefined);
  }

  function verificarRota(
    controller: any,
    nome: string,
    caminho: string,
    metodo: RequestMethod,
  ) {
    const rota = obterRotas(controller).find(
      (item) => item.nome === nome,
    );

    expect(rota).toBeDefined();
    expect(rota?.caminho).toBe(caminho);
    expect(rota?.metodo).toBe(metodo);
  }

  it('deve declarar corretamente as rotas públicas de autenticação', () => {
    verificarRota(
      AuthController,
      'login',
      'login',
      RequestMethod.POST,
    );

    verificarRota(
      AuthController,
      'cadastrar',
      'cadastro',
      RequestMethod.POST,
    );

    const rotas = obterRotas(AuthController);

    expect(
      rotas.find((rota) => rota.nome === 'login')?.guards,
    ).toHaveLength(0);

    expect(
      rotas.find((rota) => rota.nome === 'cadastrar')?.guards,
    ).toHaveLength(0);
  });

  it('deve exigir JWT na consulta do usuário autenticado', () => {
    verificarRota(
      AuthController,
      'obterUsuario',
      'me',
      RequestMethod.GET,
    );

    const rota = obterRotas(AuthController).find(
      (item) => item.nome === 'obterUsuario',
    );

    expect(rota?.guards).toContain(JwtAuthGuard);
  });

  it('deve exigir JWT e perfil docente na área docente', () => {
    verificarRota(
      AuthController,
      'areaDocente',
      'area-docente',
      RequestMethod.GET,
    );

    const rota = obterRotas(AuthController).find(
      (item) => item.nome === 'areaDocente',
    );

    expect(rota?.guards).toContain(JwtAuthGuard);
    expect(rota?.guards).toContain(RolesGuard);

    expect(
      Reflect.getMetadata(ROLES_KEY, AuthController.prototype.areaDocente),
    ).toEqual(['docente']);
  });

  it('deve exigir JWT em todas as rotas de solicitações', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      SolicitacaoController,
    );

    expect(guards).toContain(JwtAuthGuard);

    const rotasEsperadas = [
      ['listar', '/', RequestMethod.GET],
      ['cadastrar', '/', RequestMethod.POST],
      ['buscarPorId', ':id', RequestMethod.GET],
      ['atualizar', ':id', RequestMethod.PATCH],
      ['remover', ':id', RequestMethod.DELETE],
    ] as const;

    for (const [nome, caminho, metodo] of rotasEsperadas) {
      verificarRota(
        SolicitacaoController,
        nome,
        caminho,
        metodo,
      );
    }
  });

  it('deve restringir o gerenciamento de objetos aos docentes', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      GerenciamentoController,
    );

    expect(guards).toContain(JwtAuthGuard);
    expect(guards).toContain(RolesGuard);

    expect(
      Reflect.getMetadata(ROLES_KEY, GerenciamentoController),
    ).toEqual(['docente']);

    const rotasEsperadas = [
      ['atualizar', ':id', RequestMethod.PATCH],
      ['remover', ':id', RequestMethod.DELETE],
      ['devolver', ':id/devolucao', RequestMethod.PATCH],
    ] as const;

    for (const [nome, caminho, metodo] of rotasEsperadas) {
      verificarRota(
        GerenciamentoController,
        nome,
        caminho,
        metodo,
      );
    }
  });

  it('deve exigir JWT em todas as rotas de usuários', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      UsuariosController,
    );

    expect(guards).toContain(JwtAuthGuard);

    const rotasEsperadas = [
      ['listar', '/', RequestMethod.GET],
      ['buscarPorId', ':id', RequestMethod.GET],
      ['atualizar', ':id', RequestMethod.PATCH],
      ['remover', ':id', RequestMethod.DELETE],
    ] as const;

    for (const [nome, caminho, metodo] of rotasEsperadas) {
      verificarRota(
        UsuariosController,
        nome,
        caminho,
        metodo,
      );
    }
  });
});
