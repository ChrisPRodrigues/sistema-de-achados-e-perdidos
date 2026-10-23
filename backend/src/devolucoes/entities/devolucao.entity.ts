import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ObjetoEntity } from '../../objetos/entities/objeto.entity.js';
import { UsuarioEntity } from '../../usuarios/entities/usuario.entity.js';

@Entity('devolucoes')
export class DevolucaoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => ObjetoEntity, { nullable: false })
  @JoinColumn({ name: 'objeto_id' })
  objeto: ObjetoEntity;

  @ManyToOne(() => UsuarioEntity, { nullable: false })
  @JoinColumn({ name: 'usuario_id' })
  usuario: UsuarioEntity;

  @CreateDateColumn({ type: 'timestamp' })
  dataDevolucao: Date;
}