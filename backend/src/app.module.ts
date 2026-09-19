import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ObjetosModule } from './objetos/objetos.module.js';

@Module({
  imports: [ObjetosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
