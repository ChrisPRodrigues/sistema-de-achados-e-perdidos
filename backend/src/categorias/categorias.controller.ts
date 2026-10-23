import { Body, Controller, Get, Post, Param, ParseIntPipe } from '@nestjs/common';
import { CategoriasService } from './categorias.service.js';
import { Categoria } from './models/categoria.interface.js';
import { CriarCategoriaDto } from './dto/criar-categoria.dto.js';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  criar(@Body() dados: CriarCategoriaDto) {
    return this.categoriasService.criar(dados);
  }

  @Get()
  listar() {
    return this.categoriasService.listar();
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.buscarPorId(id);
  }
}