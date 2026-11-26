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
  Post,
  UseGuards,
} from '@nestjs/common';

import { DevolucaoService } from './devolucao.service.js';
import type { Devolucao } from './devolucao.interface.js';
import { CriarDevolucaoDto } from './dto/criar-devolucao.dto.js';
import { AtualizarDevolucaoDto } from './dto/atualizar-devolucao.dto.js';
import { DevolucaoRespostaDto } from './dto/devolucao-resposta.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

import { UsuarioAtual } from '../auth/decorators/usuario-atual.decorator.js';
import type { UsuarioAutenticado } from '../auth/decorators/usuario-atual.decorator.js';

@Controller('devolucoes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('docente')
export class DevolucaoController {
  constructor(
    private readonly devolucaoService: DevolucaoService,
  ) {}

  private paraResposta(
    devolucao: Devolucao,
  ): DevolucaoRespostaDto {
    return {
      id: devolucao.id,
      objetoId: devolucao.objetoId,
      usuarioId: devolucao.usuarioId,
      dataDevolucao: devolucao.dataDevolucao,
      observacao: devolucao.observacao,
    };
  }

  @Get()
  async listar(
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ): Promise<DevolucaoRespostaDto[]> {
    const devolucoes =
      await this.devolucaoService.listar(usuario);

    return devolucoes.map(
      (devolucao) => this.paraResposta(devolucao),
    );
  }

  @Get(':id')
  async buscarPorId(
    @Param('id', ParseUUIDPipe) id: string,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ): Promise<DevolucaoRespostaDto> {
    const devolucao =
      await this.devolucaoService.buscarPorId(
        id,
        usuario,
      );

    return this.paraResposta(devolucao);
  }

  @Post()
  async adicionar(
    @Body() dados: CriarDevolucaoDto,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ): Promise<DevolucaoRespostaDto> {
    const devolucao =
      await this.devolucaoService.adicionar(
        dados,
        usuario,
      );

    return this.paraResposta(devolucao);
  }

  @Patch(':id')
  async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dados: AtualizarDevolucaoDto,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ): Promise<DevolucaoRespostaDto> {
    const devolucao =
      await this.devolucaoService.atualizar(
        id,
        dados,
        usuario,
      );

    return this.paraResposta(devolucao);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remover(
    @Param('id', ParseUUIDPipe) id: string,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ): Promise<void> {
    return this.devolucaoService.remover(
      id,
      usuario,
    );
  }
}