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

import { LocaisService } from './locais.service.js';
import type { Local } from './models/local.interface.js';

@Controller('locais')
export class LocaisController {
  constructor(
    private readonly locaisService: LocaisService,
  ) {}

  @Get()
  listar(): Local[] {
    return this.locaisService.listar();
  }

  @Get(':id')
  buscarPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Local {
    return this.locaisService.buscarPorId(id);
  }

  @Post()
  adicionar(
    @Body() dados: Omit<Local, 'id'>,
  ): Local {
    return this.locaisService.adicionar(dados);
  }

  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: Partial<Omit<Local, 'id'>>,
  ): Local {
    return this.locaisService.atualizar(id, dados);
  }

  @Delete(':id')
  remover(
    @Param('id', ParseIntPipe) id: number,
  ): void {
    return this.locaisService.remover(id);
  }
}