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

import { SolicitacaoService } from './solicitacao.service.js';
import { CriarSolicitacaoDto } from './dto/criar-solicitacao.dto.js';
import { AtualizarSolicitacaoDto } from './dto/atualizar-solicitacao.dto.js';
import { SolicitacaoRespostaDto } from './dto/solicitacao-resposta.dto.js';
import type { Solicitacao } from './models/solicitacao/solicitacao.interface.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { UsuarioAtual } from '../auth/decorators/usuario-atual.decorator.js';
import type { UsuarioAutenticado } from '../auth/decorators/usuario-atual.decorator.js';

@Controller('solicitacoes')
@UseGuards(JwtAuthGuard)
export class SolicitacaoController {
  constructor(
    private readonly solicitacaoService: SolicitacaoService,
  ) {}

  private paraResposta(
    solicitacao: Solicitacao,
  ): SolicitacaoRespostaDto {
    return {
      id: solicitacao.id,
      usuarioId: solicitacao.usuarioId,
      objetoId: solicitacao.objetoId,
      status: solicitacao.status,
    };
  }

  @Get()
  async listar(
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ): Promise<SolicitacaoRespostaDto[]> {
    const solicitacoes =
      await this.solicitacaoService.listar(usuario);

    return solicitacoes.map((solicitacao) =>
      this.paraResposta(solicitacao),
    );
  }

  @Post()
  async cadastrar(
    @Body() dados: CriarSolicitacaoDto,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ): Promise<SolicitacaoRespostaDto> {
    const solicitacao =
      await this.solicitacaoService.cadastrar(dados, usuario);

    return this.paraResposta(solicitacao);
  }

  @Get(':id')
  async buscarPorId(
    @Param('id', ParseUUIDPipe) id: string,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ): Promise<SolicitacaoRespostaDto> {
    const solicitacao =
      await this.solicitacaoService.buscarPorId(id, usuario);

    return this.paraResposta(solicitacao);
  }

  @Patch(':id')
  async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dados: AtualizarSolicitacaoDto,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ): Promise<SolicitacaoRespostaDto> {
    const solicitacao =
      await this.solicitacaoService.atualizar(
        id,
        dados,
        usuario,
      );

    return this.paraResposta(solicitacao);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remover(
    @Param('id', ParseUUIDPipe) id: string,
    @UsuarioAtual() usuario: UsuarioAutenticado,
  ): Promise<void> {
    await this.solicitacaoService.remover(id, usuario);
  }
}