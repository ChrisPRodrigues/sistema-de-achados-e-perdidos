import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import type { Comprovante } from './comprovante.interface.js';
import { ComprovanteService } from './comprovante.service.js';

@Controller('comprovantes')
export class ComprovanteController {
  constructor(
    private readonly comprovanteService: ComprovanteService,
  ) {}

  @Get()
  listar(): Comprovante[] {
    return this.comprovanteService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string): Comprovante {
    return this.comprovanteService.buscarPorId(Number(id));
  }

  @Post()
  adicionar(
    @Body() dados: Omit<Comprovante, 'id'>,
  ): Comprovante {
    return this.comprovanteService.adicionar(dados);
  }

  @Patch(':id')
  atualizar(
    @Param('id') id: string,
    @Body() dados: Partial<Omit<Comprovante, 'id'>>,
  ): Comprovante {
    return this.comprovanteService.atualizar(
      Number(id),
      dados,
    );
  }

  @Delete(':id')
  remover(@Param('id') id: string): void {
    return this.comprovanteService.remover(Number(id));
  }
}