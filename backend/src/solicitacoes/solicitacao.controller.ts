
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { SolicitacaoService } from './solicitacao.service.js';
import { CriarSolicitacaoDto } from './dto/criar-solicitacao.dto.js';
import { AtualizarSolicitacaoDto } from './dto/atualizar-solicitacao.dto.js';
import { SolicitacaoRespostaDto } from './dto/solicitacao-resposta.dto.js';
import type { Solicitacao } from './models/solicitacao/solicitacao.interface.js';

@Controller('solicitacoes')
export class SolicitacaoController {
  constructor(
    private readonly solicitacaoService: SolicitacaoService,
  ) {}

  private paraResposta(
    solicitacao: Solicitacao
  ): SolicitacaoRespostaDto {
    return {
      id: solicitacao.id,
      usuarioId: solicitacao.usuarioId,
      objetoId: solicitacao.objetoId,
      status: solicitacao.status,
    };
  }

  @Get()
  listar(): SolicitacaoRespostaDto[] {
    return this.solicitacaoService.listar().map((solicitacao) =>
      this.paraResposta(solicitacao)
    );
  }

  @Post()
  cadastrar(
    @Body() solicitacao: CriarSolicitacaoDto): SolicitacaoRespostaDto {
    return this.paraResposta(this.solicitacaoService.cadastrar(solicitacao));
  }

  @Get(':id')
  buscarPorId(
    @Param('id', ParseIntPipe) id: number
  ): SolicitacaoRespostaDto {
    const solicitacao = this.solicitacaoService.buscarPorId(id);

    if (!solicitacao) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    return this.paraResposta(solicitacao);
  }

  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: AtualizarSolicitacaoDto,
  ): SolicitacaoRespostaDto {
    const solicitacao = this.solicitacaoService.atualizar(id, dados);

    if (!solicitacao) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    return this.paraResposta(solicitacao);
  }

  @Delete(':id')
  remover(
    @Param('id', ParseIntPipe) id: number
  ): boolean {

    return this.solicitacaoService.remover(id);
  }
}