
import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ObjetoEntity } from './entities/objeto.entity.js';
import { ObjetoRespostaDto } from './dto/objeto-resposta.dto.js';
import { paraObjetoResposta } from './dto/objeto-resposta.mapper.js';

@Controller('objetos')
export class ObjetosController {
  constructor(
    @InjectRepository(ObjetoEntity)
    private readonly objetosRepository: Repository<ObjetoEntity>,
  ) {}

  // Listagem original utilizada pelo frontend
  @Get()
  async listar(): Promise<ObjetoRespostaDto[]> {
    const objetos = await this.objetosRepository.find({
      relations: {
        categoria: true,
        localEncontrado: true,
        usuario: true,
      },
      order: {
        id: 'ASC',
      },
    });

    return objetos.map((objeto) => paraObjetoResposta(objeto));
  }

  // Listagem paginada para a atividade E2
  @Get('paginados')
  async listarPaginados(
    @Query('pagina') paginaParam?: string,
    @Query('limite') limiteParam?: string,
  ): Promise<{
    dados: ObjetoRespostaDto[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  }> {
    const numeroPagina = Number(paginaParam ?? 1);
    const numeroLimite = Number(limiteParam ?? 10);

    const pagina =
      Number.isInteger(numeroPagina) && numeroPagina > 0
        ? numeroPagina
        : 1;

    const limite =
      Number.isInteger(numeroLimite) && numeroLimite > 0
        ? Math.min(numeroLimite, 50)
        : 10;

    const [objetos, total] =
      await this.objetosRepository.findAndCount({
        relations: {
          categoria: true,
          localEncontrado: true,
          usuario: true,
        },
        order: {
          id: 'ASC',
        },
        skip: (pagina - 1) * limite,
        take: limite,
      });

    return {
      dados: objetos.map((objeto) => paraObjetoResposta(objeto)),
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  }
}
