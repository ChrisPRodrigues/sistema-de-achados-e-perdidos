import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { UsuariosService } from './usuarios.service.js';
import { UsuarioEntity } from './entities/usuario.entity.js';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto.js';
import { UsuarioRespostaDto } from './dto/usuario-resposta.dto.js';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
  ) {}

  private paraResposta(
    usuario: UsuarioEntity,
  ): UsuarioRespostaDto {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
    };
  }

  @Get()
  async listar(): Promise<UsuarioRespostaDto[]> {
    const usuarios = await this.usuariosService.listar();

    return usuarios.map((usuario) => this.paraResposta(usuario));
  }

  @Get(':id')
  async buscarPorId(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UsuarioRespostaDto> {
    const usuario = await this.usuariosService.buscarPorId(id);

    return this.paraResposta(usuario);
  }

  @Patch(':id')
  async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dados: AtualizarUsuarioDto,
  ): Promise<UsuarioRespostaDto> {
    const usuarioAtualizado = await this.usuariosService.atualizar(id, dados);

    return this.paraResposta(usuarioAtualizado);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remover(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.usuariosService.remover(id);
  }
}
