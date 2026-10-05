import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { ObjetosModule } from './objetos/objetos.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { DevolucoesModule } from './devolucoes/devolucoes.module.js';

@Module({
  imports: [
    ObjetosModule,
    UsuariosModule,
    DevolucoesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}