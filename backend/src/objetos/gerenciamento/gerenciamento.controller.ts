import { Body, Controller, Param, ParseIntPipe, Patch } from '@nestjs/common';

import { GerenciamentoService } from './gerenciamento.service.js';

import type { Objeto } from '../models/objeto/objeto.interface.js';

@Controller('objetos')
export class GerenciamentoController {
  constructor(
    private readonly gerenciamentoService: GerenciamentoService,
  ) {}

  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: Partial<Omit<Objeto, 'id'>>,
  ): Objeto {
    return this.gerenciamentoService.atualizar(id, dados);
  }

  @Patch(':id/devolucao')
  devolver(
    @Param('id', ParseIntPipe) id: number,
  ): Objeto {
    return this.gerenciamentoService.devolver(id);
  }
}