
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { UsuariosService } from './usuarios.service.js';
import { UsuarioEntity } from './entities/usuario.entity.js';

type DadosUsuario = {
  nome: string;
  email: string;
  tipo: 'aluno' | 'docente';
};

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  listar(): Promise<UsuarioEntity[]> {
    return this.usuariosService.listar();
  }

  @Post()
  cadastrar(@Body() usuario: DadosUsuario): Promise<UsuarioEntity> {
    return this.usuariosService.cadastrar(usuario);
  }

  @Get(':id')
  buscarPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UsuarioEntity> {
    return this.usuariosService.buscarPorId(id);
  }

  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: Partial<DadosUsuario>,
  ): Promise<UsuarioEntity> {
    return this.usuariosService.atualizar(id, dados);
  }

  @Delete(':id')
  remover(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ mensagem: string }> {
    return this.usuariosService.remover(id);
  }
}
