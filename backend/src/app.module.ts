import 'dotenv/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ObjetosModule } from './objetos/objetos.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';

import { UsuarioEntity } from './usuarios/entities/usuario.entity.js';
import { CategoriaEntity } from './categorias/entities/categoria.entity.js';
import { LocalEntity } from './locais/entities/local.entity.js';
import { ObjetoEntity } from './objetos/entities/objeto.entity.js';
import { DevolucaoEntity } from './devolucoes/entities/devolucao.entity.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [
        UsuarioEntity,
        CategoriaEntity,
        LocalEntity,
        ObjetoEntity,
        DevolucaoEntity,
      ],
      synchronize: false,
    }),
    ObjetosModule,
    UsuariosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}