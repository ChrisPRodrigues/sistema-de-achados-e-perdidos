
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
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
  buscarPorId(@Param('id') id: string): Solicitacao {
    const solicitacao = this.solicitacaoService.buscarPorId(Number(id));

    if (!solicitacao) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    return solicitacao;
  }

  @Patch(':id')
  atualizar(
    @Param('id') id: string,
    @Body() dados: Partial<Solicitacao>,
  ): Solicitacao {
    const solicitacao = this.solicitacaoService.atualizar(Number(id), dados);

    if (!solicitacao) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    return solicitacao;
  }

  @Delete(':id')
  remover(@Param('id') id: string): boolean {
    return this.solicitacaoService.remover(Number(id));
  }
}
