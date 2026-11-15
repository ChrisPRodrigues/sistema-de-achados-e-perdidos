
import {
  BadRequestException,
  Controller,
  Get,
  Query,
  ParseUUIDPipe,
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
      throw new BadRequestException('Informe uma data válida.');
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

  // 3. Objetos cadastrados por um usuário
  // GET /consultas/usuario?id=UUID_DO_USUARIO
  @Get('usuario')
  objetosPorUsuario(
    @Query('id', new ParseUUIDPipe()) usuarioId: string,
  ) {
    return this.consultasService.objetosPorUsuario(usuarioId);
  }

  // 4. Filtrar por status
  // GET /consultas/status
  @Get('status')
  objetosPorStatus() {
    return this.consultasService.objetosPorStatus();
  }

  // 5. Objetos sem descrição
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

  // 7. Objetos cujo nome começa com um texto
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
