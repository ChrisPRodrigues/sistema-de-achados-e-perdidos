import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjetoEntity } from '../../objetos/entities/objeto.entity.js';

@Entity('categorias')
export class CategoriaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  nome: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  descricao: string | null;

  @OneToMany(() => ObjetoEntity, (objeto) => objeto.categoria)
  objetos: ObjetoEntity[];
}