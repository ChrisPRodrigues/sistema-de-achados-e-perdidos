import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
    type: 'enum',
    enum: ['aluno', 'docente'],
  })
  tipo: 'aluno' | 'docente';

  @OneToMany(() => ObjetoEntity, (objeto) => objeto.usuario)
  objetos: ObjetoEntity[];

  @OneToMany(() => SolicitacaoEntity, (solicitacao) => solicitacao.usuario)
  solicitacoes: SolicitacaoEntity[];

  @OneToMany(() => DevolucaoEntity, (devolucao) => devolucao.usuario)
  devolucoes: DevolucaoEntity[];
}