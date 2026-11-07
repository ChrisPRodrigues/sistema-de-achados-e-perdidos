
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';

import { ObjetoEntity } from '../../objetos/entities/objeto.entity.js';
import { UsuarioEntity } from '../../usuarios/entities/usuario.entity.js';

@Entity('devolucoes')
export class DevolucaoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => ObjetoEntity, (objeto) => objeto.devolucao, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'objeto_id' })
  objeto: Relation<ObjetoEntity>;

  @ManyToOne(() => UsuarioEntity, (usuario) => usuario.devolucoes, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Relation<UsuarioEntity>;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  observacao: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  dataDevolucao: Date;
}
