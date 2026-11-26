import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { GerenciamentoService } from './gerenciamento.service.js';
import { AtualizarObjetoDto } from '../dto/atualizar-objeto.dto.js';
import { RegistrarDevolucaoDto } from '../../devolucoes/dto/registrar-devolucao.dto.js';
import { ObjetoRespostaDto } from '../dto/objeto-resposta.dto.js';
import { paraObjetoResposta } from '../dto/objeto-resposta.mapper.js';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';

import { UsuarioAtual } from '../../auth/decorators/usuario-atual.decorator.js';
import type { UsuarioAutenticado } from '../../auth/decorators/usuario-atual.decorator.js';

@Controller('objetos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('docente')
export class GerenciamentoController {
  constructor(
    private readonly gerenciamentoService: GerenciamentoService,
  ) {}

  @Patch(':id')
  async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dados: AtualizarObjetoDto,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ): Promise<ObjetoRespostaDto> {
    const objetoAtualizado =
      await this.gerenciamentoService.atualizar(
        id,
        dados,
        usuario,
      );

    return paraObjetoResposta(objetoAtualizado);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remover(
    @Param('id', ParseUUIDPipe) id: string,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ): Promise<void> {
    return this.gerenciamentoService.remover(
      id,
      usuario,
    );
  }

  @Patch(':id/devolucao')
  async devolver(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dados: RegistrarDevolucaoDto,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ): Promise<ObjetoRespostaDto> {
    const objetoDevolvido =
      await this.gerenciamentoService.devolver(
        id,
        usuario,
        dados.observacao,
      );

    return paraObjetoResposta(objetoDevolvido);
  }
}