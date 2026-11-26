import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';
import { UsuarioEntity } from '../usuarios/entities/usuario.entity.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsuarioEntity]),

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');

        if (!secret || secret.length < 32) {
          throw new Error(
            'JWT_SECRET deve conter pelo menos 32 caracteres',
          );
        }

        return {
          secret,
          signOptions: {
            expiresIn: '1h',
          },
        };
      },
    }),
  ],
  providers: [AuthService, JwtAuthGuard, RolesGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule],
  controllers: [AuthController],
})
export class AuthModule {}