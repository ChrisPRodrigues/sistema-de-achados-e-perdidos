import { Injectable } from '@nestjs/common';
import type { Usuario } from './models/usuario/usuario.interface.js';

@Injectable()
export class UsuariosService {
  private usuarios: Usuario[] = [];

  private proximoId = 1;

  listar(): Usuario[] {
    return this.usuarios;
  }

  cadastrar(dados: Omit<Usuario, 'id'>): Usuario {
    const novoUsuario: Usuario = {
      id: this.proximoId++,
      ...dados,
    };

    this.usuarios.push(novoUsuario);

    return novoUsuario;
  }

  buscarPorId(id: number): Usuario | undefined {
    return this.usuarios.find((usuario) => usuario.id === id);
  }

  atualizar(id: number, dados: Partial<Usuario>): Usuario | undefined {
    const usuario = this.buscarPorId(id);

    if (!usuario) {
      return undefined;
    }

    Object.assign(usuario, dados);

    return usuario;
  }

  remover(id: number): boolean {
    const indice = this.usuarios.findIndex((usuario) => usuario.id === id);

    if (indice === -1) {
      return false;
    }

    this.usuarios.splice(indice, 1);

    return true;
  }
}