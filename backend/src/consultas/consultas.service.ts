
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ILike,
  In,
  IsNull,
  LessThan,
  Repository,
} from 'typeorm';

import { ObjetoEntity } from '../objetos/entities/objeto.entity.js';

@Injectable()
export class ConsultasService {
  constructor(
    @InjectRepository(ObjetoEntity)
    private readonly objetosRepository: Repository<ObjetoEntity>,
  ) {}

  // Consulta 1 — Objetos encontrados antes de uma data
  async objetosAntesDe(data: Date): Promise<ObjetoEntity[]> {
    return this.objetosRepository.find({
      where: {
        dataEncontrado: LessThan(data),
      },
    });
  }

  // Consulta 2 — Buscar objetos pelo nome
  async objetosPorNome(nome: string): Promise<ObjetoEntity[]> {
    return this.objetosRepository.find({
      where: {
        nome: ILike(`%${nome}%`),
      },
    });
  }

  // Consulta 3 — Objetos cadastrados por um usuário
  async objetosPorUsuario(
    usuarioId: string,
  ): Promise<ObjetoEntity[]> {
    return this.objetosRepository.find({
      where: {
        usuario: {
          id: usuarioId,
        },
      },
      relations: {
        usuario: true,
      },
    });
  }

  // Consulta 4 — Objetos por status
  async objetosPorStatus(): Promise<ObjetoEntity[]> {
    return this.objetosRepository.find({
      where: {
        status: In(['encontrado', 'devolvido']),
      },
    });
  }

  // Consulta 5 — Objetos sem descrição
  async objetosSemDescricao(): Promise<ObjetoEntity[]> {
    return this.objetosRepository.find({
      where: {
        descricao: IsNull(),
      },
    });
  }

  // Consulta 6 — Dez objetos mais recentes
  async objetosRecentes(): Promise<ObjetoEntity[]> {
    return this.objetosRepository.find({
      order: {
        dataEncontrado: 'DESC',
      },
      take: 10,
    });
  }

  // Consulta 7 — Objetos cujo nome começa com um texto
  async objetosQueComecamCom(
    texto: string,
  ): Promise<ObjetoEntity[]> {
    return this.objetosRepository.find({
      where: {
        nome: ILike(`${texto}%`),
      },
    });
  }

  // Consulta 8 — Quantidade total de objetos
  async contarObjetos(): Promise<number> {
    return this.objetosRepository.count();
  }
}
