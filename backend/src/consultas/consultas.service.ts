
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  ILike,
  In,
  IsNull,
  LessThan,
  MoreThan,
  Repository,
} from 'typeorm';

import { ObjetoEntity } from '../objetos/entities/objeto.entity.js';

@Injectable()
export class ConsultasService {
  constructor(
    @InjectRepository(ObjetoEntity)
    private readonly objetosRepository: Repository<ObjetoEntity>,
  ) {}

  // 1. Objetos encontrados antes de uma data
  async objetosAntesDe(data: Date) {
    return this.objetosRepository.find({
      where: {
        dataEncontrado: LessThan(data),
      },
    });
  }

  // 2. Objetos com determinado nome (sem diferenciar maiúsculas)
  async objetosPorNome(nome: string) {
    return this.objetosRepository.find({
      where: {
        nome: ILike(`%${nome}%`),
      },
    });
  }

  // 3. Objetos cadastrados por determinado usuário
  async objetosPorUsuario(usuarioId: number) {
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

  // 4. Objetos com status encontrado ou devolvido
  async objetosPorStatus() {
    return this.objetosRepository.find({
      where: {
        status: In(['encontrado', 'devolvido']),
      },
    });
  }

  // 5. Objetos sem descrição
  async objetosSemDescricao() {
    return this.objetosRepository.find({
      where: {
        descricao: IsNull(),
      },
    });
  }

  // 6. Dez objetos encontrados mais recentemente
  async objetosRecentes() {
    return this.objetosRepository.find({
      order: {
        dataEncontrado: 'DESC',
      },
      take: 10,
    });
  }

  // 7. Objetos cujo nome começa com determinado texto
  async objetosQueComecamCom(texto: string) {
    return this.objetosRepository.find({
      where: {
        nome: ILike(`${texto}%`),
      },
    });
  }

  // 8. Quantidade total de objetos
  async contarObjetos() {
    return this.objetosRepository.count();
  }
}
