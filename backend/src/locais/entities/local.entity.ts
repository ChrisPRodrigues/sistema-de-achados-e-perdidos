import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjetoEntity } from '../../objetos/entities/objeto.entity.js';

@Entity('locais')
export class LocalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
  })
  nome: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  descricao: string | null;

  @OneToMany(() => ObjetoEntity, (objeto) => objeto.localEncontrado)
  objetos: ObjetoEntity[];
}