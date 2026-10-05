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
}