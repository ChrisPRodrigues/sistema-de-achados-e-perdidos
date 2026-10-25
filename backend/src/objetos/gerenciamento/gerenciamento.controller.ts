
import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';

import { GerenciamentoService } from './gerenciamento.service.js';
import { ObjetoEntity } from '../entities/objeto.entity.js';
import { AtualizarObjetoDto } from '../dto/atualizar-objeto.dto.js';
import { RegistrarDevolucaoDto } from '../../devolucoes/dto/registrar-devolucao.dto.js';

@Controller('objetos')
export class GerenciamentoController {
  constructor(
    private readonly gerenciamentoService: GerenciamentoService,
  ) {}

  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: AtualizarObjetoDto,
  ): Promise<ObjetoEntity> {
    return this.gerenciamentoService.atualizar(id, dados);
  }

  @Patch(':id/devolucao')
  devolver(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: RegistrarDevolucaoDto,
  ): Promise<ObjetoEntity> {
    return this.gerenciamentoService.devolver(
      id,
      dados.usuarioId,
      dados.observacao,
    );
  }
}
