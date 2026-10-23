
import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';

import { GerenciamentoService } from './gerenciamento.service.js';
import { ObjetoEntity } from '../entities/objeto.entity.js';

type DadosAtualizacaoObjeto = {
  nome?: string;
  descricao?: string;
  categoriaId?: number;
  localId?: number;
  dataEncontrado?: Date;
};

type DadosDevolucao = {
  usuarioId: number;
};

@Controller('objetos')
export class GerenciamentoController {
  constructor(
    private readonly gerenciamentoService: GerenciamentoService,
  ) {}

  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: DadosAtualizacaoObjeto,
  ): Promise<ObjetoEntity> {
    return this.gerenciamentoService.atualizar(id, dados);
  }

  @Patch(':id/devolucao')
  devolver(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: DadosDevolucao,
  ): Promise<ObjetoEntity> {
    return this.gerenciamentoService.devolver(
      id,
      dados.usuarioId,
    );
  }
}
