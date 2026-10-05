import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SolicitacaoService } from './solicitacao.service.js';
import type { Solicitacao } from './models/solicitacao/solicitacao.interface.js';

@Controller('solicitacoes')
export class SolicitacaoController {
  constructor(
    private readonly solicitacaoService: SolicitacaoService,
  ) {}

  @Get()
  listar(): Solicitacao[] {
    return this.solicitacaoService.listar();
  }

  @Post()
  cadastrar(@Body() solicitacao: Omit<Solicitacao, 'id'>): Solicitacao {
    return this.solicitacaoService.cadastrar(solicitacao);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string): Solicitacao | undefined {
    return this.solicitacaoService.buscarPorId(Number(id));
  }

  @Patch(':id')
  atualizar(
    @Param('id') id: string,
    @Body() dados: Partial<Solicitacao>,
  ): Solicitacao | undefined {
    return this.solicitacaoService.atualizar(Number(id), dados);
  }

  @Delete(':id')
  remover(@Param('id') id: string): boolean {
    return this.solicitacaoService.remover(Number(id));
  }
}