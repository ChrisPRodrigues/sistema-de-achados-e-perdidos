
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';

import { CategoriaEntity } from '../../categorias/entities/categoria.entity.js';
import { LocalEntity } from '../../locais/entities/local.entity.js';
import { UsuarioEntity } from '../../usuarios/entities/usuario.entity.js';
import { SolicitacaoEntity } from '../../solicitacoes/entities/solicitacao.entity.js';
import { DevolucaoEntity } from '../../devolucoes/entities/devolucao.entity.js';

@Entity('objetos')
export class ObjetoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  nome: string;

  @Column({ type: 'text' })
  descricao: string;

  @ManyToOne(() => CategoriaEntity, (categoria) => categoria.objetos, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Relation<CategoriaEntity>;

  @ManyToOne(() => LocalEntity, (local) => local.objetos, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'local_id' })
  localEncontrado: Relation<LocalEntity>;

  @ManyToOne(() => UsuarioEntity, (usuario) => usuario.objetos, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Relation<UsuarioEntity>;

  @Column({ type: 'timestamptz' })
  dataEncontrado: Date;

  @Column({
    type: 'enum',
    enum: ['encontrado', 'devolvido'],
    default: 'encontrado',
  })
  status: 'encontrado' | 'devolvido';

  @OneToMany(() => SolicitacaoEntity, (solicitacao) => solicitacao.objeto)
  solicitacoes: Relation<SolicitacaoEntity[]>;

  @OneToOne(() => DevolucaoEntity, (devolucao) => devolucao.objeto)
  devolucao: Relation<DevolucaoEntity>;
}
