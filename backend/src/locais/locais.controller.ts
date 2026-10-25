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
import { LocalEntity } from './entities/local.entity.js';
import { CriarLocalDto } from './dto/criar-local.dto.js';
import { AtualizarLocalDto } from './dto/atualizar-local.dto.js';

@Controller('locais')
export class LocaisController {
  constructor(
    private readonly locaisService: LocaisService,
  ) {}

  @Get()
  listar(): Promise<LocalEntity[]> {
    return this.locaisService.listar();
  }

  @Get(':id')
  buscarPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<LocalEntity> {
    return this.locaisService.buscarPorId(id);
  }

  @Post()
  adicionar(
    @Body() dados: CriarLocalDto,
  ): Promise<LocalEntity> {
    return this.locaisService.adicionar(dados);
  }

  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dados: AtualizarLocalDto,
  ): Promise<LocalEntity> {
    return this.locaisService.atualizar(id, dados);
  }

  @Delete(':id')
  remover(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.locaisService.remover(id);
  }
}