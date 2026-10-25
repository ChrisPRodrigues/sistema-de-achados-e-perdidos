import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';

import { CadastroService } from './cadastro.service.js';
import { ObjetoEntity } from '../entities/objeto.entity.js';
import { CriarObjetoDto } from '../dto/criar-objeto.dto.js';

@Controller('objetos')
export class CadastroController {
  constructor(
    private readonly cadastroService: CadastroService,
  ) {}

  @Post()
  cadastrar(
    @Body() dados: CriarObjetoDto,
  ): Promise<ObjetoEntity> {
    return this.cadastroService.cadastrar(dados);
  }

  @Get(':id')
  buscarPorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ObjetoEntity> {
    return this.cadastroService.buscarPorId(id);
  }
}