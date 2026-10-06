import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { ObjetosModule } from './objetos/objetos.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { DevolucoesModule } from './devolucoes/devolucoes.module.js';
import { CategoriasModule } from './categorias/categorias.module.js';
import { LocaisModule } from './locais/locais.module.js';
import { SolicitacoesModule } from './solicitacoes/solicitacoes.module.js';
import { ComprovanteModule } from './comprovantes/comprovante.module.js';
import { HistoricoModule } from './historicos/historico.module.js';

@Module({
  imports: [
    ObjetosModule,
    UsuariosModule,
    DevolucoesModule,
    CategoriasModule,
    LocaisModule,
    SolicitacoesModule,
    ComprovanteModule,
    HistoricoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}