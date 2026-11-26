
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';

import { ObjetoEntity } from '../../objetos/entities/objeto.entity.js';
import { SolicitacaoEntity } from '../../solicitacoes/entities/solicitacao.entity.js';
import { DevolucaoEntity } from '../../devolucoes/entities/devolucao.entity.js';

@Entity('usuarios')
export class UsuarioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  nome: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({
    name: 'senha_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  senhaHash: string | null;

  @Column({
    type: 'enum',
    enum: ['aluno', 'docente'],
  })
  tipo: 'aluno' | 'docente';

  @OneToMany(() => ObjetoEntity, (objeto) => objeto.usuario)
  objetos: Relation<ObjetoEntity[]>;

  @OneToMany(() => SolicitacaoEntity, (solicitacao) => solicitacao.usuario)
  solicitacoes: Relation<SolicitacaoEntity[]>;

  @OneToMany(() => DevolucaoEntity, (devolucao) => devolucao.usuario)
  devolucoes: Relation<DevolucaoEntity[]>;
}
