import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
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

  @Get(':id')
  buscarPorId(@Param('id') id: string): Usuario | undefined {
    return this.usuariosService.buscarPorId(Number(id));
  }

  @Patch(':id')
  atualizar(
    @Param('id') id: string,
    @Body() dados: Partial<Usuario>,
  ): Usuario | undefined {
    return this.usuariosService.atualizar(Number(id), dados);
  }
}