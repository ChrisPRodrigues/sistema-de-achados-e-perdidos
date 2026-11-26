import {
  ForbiddenException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DevolucaoEntity } from './entities/devolucao.entity.js';
import { ObjetoEntity } from '../objetos/entities/objeto.entity.js';
import { UsuarioEntity } from '../usuarios/entities/usuario.entity.js';
import type { Devolucao } from './devolucao.interface.js';

import type { UsuarioAutenticado } from '../auth/decorators/usuario-atual.decorator.js';
import { verificarPropriedade } from '../auth/utils/propriedade.js';

type DadosCriacaoDevolucao = {
  objetoId: string;
  observacao?: string;
};

@Injectable()
export class DevolucaoService {
  constructor(
    @InjectRepository(DevolucaoEntity)
    private readonly devolucoes:
      Repository<DevolucaoEntity>,
  ) {}

  private verificarDocente(
    usuario: UsuarioAutenticado,
  ): void {
    if (usuario.tipo !== 'docente') {
      throw new ForbiddenException(
        'Somente docentes podem gerenciar devoluções',
      );
    }
  }

  async listar(
    usuario: UsuarioAutenticado,
  ): Promise<Devolucao[]> {
    this.verificarDocente(usuario);

    const registros = await this.devolucoes.find({
      where: {
        usuario: { id: usuario.sub },
      },
      relations: {
        objeto: true,
        usuario: true,
      },
      order: { id: 'ASC' },
    });

    return registros.map(
      (item) => this.converter(item),
    );
  }

  async buscarPorId(
    id: string,
    usuario: UsuarioAutenticado,
  ): Promise<Devolucao> {
    this.verificarDocente(usuario);

    const registro =
      await this.devolucoes.findOne({
        where: { id },
        relations: {
          objeto: true,
          usuario: true,
        },
      });

    if (!registro) {
      throw new NotFoundException(
        'Devolução não encontrada',
      );
    }

    verificarPropriedade(
      usuario,
      registro.usuario.id,
    );

    return this.converter(registro);
  }

  async adicionar(
    dados: DadosCriacaoDevolucao,
    usuarioAutenticado: UsuarioAutenticado,
  ): Promise<Devolucao> {
    this.verificarDocente(usuarioAutenticado);

    const registroId =
      await this.devolucoes.manager.transaction(
        async (manager) => {
          const usuario = await manager
            .getRepository(UsuarioEntity)
            .findOneBy({
              id: usuarioAutenticado.sub,
            });

          if (!usuario) {
            throw new NotFoundException(
              'Usuário não encontrado',
            );
          }

          if (usuario.tipo !== 'docente') {
            throw new ForbiddenException(
              'Somente docentes podem registrar devoluções',
            );
          }

          const objeto = await manager
            .getRepository(ObjetoEntity)
            .createQueryBuilder('objeto')
            .setLock('pessimistic_write')
            .where('objeto.id = :id', {
              id: dados.objetoId,
            })
            .getOne();

          if (!objeto) {
            throw new NotFoundException(
              'Objeto não encontrado',
            );
          }

          if (objeto.status === 'devolvido') {
            throw new ConflictException(
              'Este objeto já foi devolvido',
            );
          }

          const devolucaoExistente = await manager
            .getRepository(DevolucaoEntity)
            .findOne({
              where: {
                objeto: { id: objeto.id },
              },
            });

          if (devolucaoExistente) {
            throw new ConflictException(
              'Este objeto já possui uma devolução registrada',
            );
          }

          objeto.status = 'devolvido';

          await manager.save(
            ObjetoEntity,
            objeto,
          );

          const devolucao = manager.create(
            DevolucaoEntity,
            {
              objeto,
              usuario,
              observacao: dados.observacao ?? null,
            },
          );

          const salvo = await manager.save(
            DevolucaoEntity,
            devolucao,
          );

          return salvo.id;
        },
      );

    return this.buscarPorId(
      registroId,
      usuarioAutenticado,
    );
  }

  async atualizar(
    id: string,
    dados: { observacao?: string },
    usuario: UsuarioAutenticado,
  ): Promise<Devolucao> {
    this.verificarDocente(usuario);

    const registro =
      await this.devolucoes.findOne({
        where: { id },
        relations: {
          objeto: true,
          usuario: true,
        },
      });

    if (!registro) {
      throw new NotFoundException(
        'Devolução não encontrada',
      );
    }

    verificarPropriedade(
      usuario,
      registro.usuario.id,
    );

    if (dados.observacao !== undefined) {
      registro.observacao = dados.observacao;
    }

    await this.devolucoes.save(registro);

    return this.buscarPorId(id, usuario);
  }

  async remover(
    id: string,
    usuario: UsuarioAutenticado,
  ): Promise<void> {
    this.verificarDocente(usuario);

    await this.devolucoes.manager.transaction(
      async (manager) => {
        const devolucoesRepository =
          manager.getRepository(DevolucaoEntity);

        const devolucao =
          await devolucoesRepository.findOne({
            where: { id },
            relations: {
              objeto: true,
              usuario: true,
            },
          });

        if (!devolucao) {
          throw new NotFoundException(
            'Devolução não encontrada',
          );
        }

        verificarPropriedade(
          usuario,
          devolucao.usuario.id,
        );

        const objeto = await manager
          .getRepository(ObjetoEntity)
          .createQueryBuilder('objeto')
          .setLock('pessimistic_write')
          .where('objeto.id = :id', {
            id: devolucao.objeto.id,
          })
          .getOne();

        if (!objeto) {
          throw new NotFoundException(
            'Objeto não encontrado',
          );
        }

        const registroAtual =
          await devolucoesRepository.findOne({
            where: { id },
            relations: {
              usuario: true,
            },
          });

        if (!registroAtual) {
          throw new NotFoundException(
            'Devolução não encontrada',
          );
        }

        verificarPropriedade(
          usuario,
          registroAtual.usuario.id,
        );

        await devolucoesRepository.remove(
          registroAtual,
        );

        objeto.status = 'encontrado';

        await manager.save(
          ObjetoEntity,
          objeto,
        );
      },
    );
  }

  private converter(
    registro: DevolucaoEntity,
  ): Devolucao {
    return {
      id: registro.id,
      objetoId: registro.objeto.id,
      usuarioId: registro.usuario.id,
      dataDevolucao: registro.dataDevolucao,
      observacao: registro.observacao ?? undefined,
    };
  }
}