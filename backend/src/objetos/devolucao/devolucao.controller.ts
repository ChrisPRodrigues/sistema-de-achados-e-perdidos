import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { DevolucaoService } from './devolucao.service.js';
import type { Devolucao } from './devolucao.interface.js';

@Controller('devolucoes')
export class DevolucaoController {
  constructor(
    private readonly devolucaoService: DevolucaoService,
  ) {}

  @Get()
  listar(): Devolucao[] {
    return this.devolucaoService.listar();
  }

  @Get(':id')
  buscarPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Devolucao {
    return this.devolucaoService.buscarPorId(id);
  }

  @Post()
  adicionar(
    @Body()
    dados: Omit<Devolucao, 'id' | 'dataDevolucao'>,
  ): Devolucao {
    return this.devolucaoService.adicionar(dados);
  }

  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: Partial<Omit<Devolucao, 'id'>>,
  ): Devolucao {
    return this.devolucaoService.atualizar(id, dados);
  }

  @Delete(':id')
  remover(
    @Param('id', ParseIntPipe) id: number,
  ): void {
    return this.devolucaoService.remover(id);
  }
}