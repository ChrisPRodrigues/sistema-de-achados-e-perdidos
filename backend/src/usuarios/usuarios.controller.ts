import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import type { Usuario } from './models/usuario/usuario.interface.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  listar(): Usuario[] {
    return this.usuariosService.listar();
  }

  @Post()
  cadastrar(@Body() usuario: Usuario): Usuario {
    return this.usuariosService.cadastrar(usuario);
  }
}