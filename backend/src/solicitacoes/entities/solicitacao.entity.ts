
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { Relation } from 'typeorm';

import { UsuarioEntity } from '../../usuarios/entities/usuario.entity.js';
import { ObjetoEntity } from '../../objetos/entities/objeto.entity.js';

@Entity('solicitacoes')
@Unique('UQ_solicitacoes_usuario_objeto', ['usuario', 'objeto'])
export class SolicitacaoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UsuarioEntity, (usuario) => usuario.solicitacoes, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Relation<UsuarioEntity>;

  @ManyToOne(() => ObjetoEntity, (objeto) => objeto.solicitacoes, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'objeto_id' })
  objeto: Relation<ObjetoEntity>;

  @Column({
    type: 'enum',
    enum: ['pendente', 'aprovada', 'recusada'],
    default: 'pendente',
  })
  status: 'pendente' | 'aprovada' | 'recusada';
}
