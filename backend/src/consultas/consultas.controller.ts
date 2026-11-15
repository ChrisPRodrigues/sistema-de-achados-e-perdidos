
import {
  BadRequestException,
  Controller,
  Get,
  Query,
} from '@nestjs/common';

import { ConsultasService } from './consultas.service.js';

@Controller('consultas')
export class ConsultasController {
  constructor(
    private readonly consultasService: ConsultasService,
  ) {}

  // 1. Objetos encontrados antes de uma data
  // GET /consultas/antes-de?data=2026-11-01
  @Get('antes-de')
  objetosAntesDe(@Query('data') data: string) {
    const dataConvertida = new Date(data);

    if (!data || Number.isNaN(dataConvertida.getTime())) {
      throw new BadRequestException('Informe uma data vÃ¡lida.');
    }

    return this.consultasService.objetosAntesDe(dataConvertida);
  }

  // 2. Buscar objetos pelo nome
  // GET /consultas/nome?texto=bola
  @Get('nome')
  objetosPorNome(@Query('texto') texto: string) {
    if (!texto) {
      throw new BadRequestException('Informe o texto.');
    }

    return this.consultasService.objetosPorNome(texto);
  }

  // 3. Objetos de um usuÃ¡rio
  // GET /consultas/usuario?id=1
  @Get('usuario')
  objetosPorUsuario(@Query('id') id: string) {
    const usuarioId = Number(id);

    if (!id || !Number.isInteger(usuarioId) || usuarioId <= 0) {
      throw new BadRequestException('Informe um ID vÃ¡lido.');
    }

    return this.consultasService.objetosPorUsuario(usuarioId);
  }

  // 4. Filtrar por status
  // GET /consultas/status
  @Get('status')
  objetosPorStatus() {
    return this.consultasService.objetosPorStatus();
  }

  // 5. Objetos sem descriÃ§Ã£o
  // GET /consultas/sem-descricao
  @Get('sem-descricao')
  objetosSemDescricao() {
    return this.consultasService.objetosSemDescricao();
  }

  // 6. Dez objetos mais recentes
  // GET /consultas/recentes
  @Get('recentes')
  objetosRecentes() {
    return this.consultasService.objetosRecentes();
  }

  // 7. Objetos cujo nome comeÃ§a com um texto
  // GET /consultas/comeca-com?texto=Bo
  @Get('comeca-com')
  objetosQueComecamCom(@Query('texto') texto: string) {
    if (!texto) {
      throw new BadRequestException('Informe o texto.');
    }

    return this.consultasService.objetosQueComecamCom(texto);
  }

  // 8. Contar objetos
  // GET /consultas/total
  @Get('total')
  contarObjetos() {
    return this.consultasService.contarObjetos();
  }
}
