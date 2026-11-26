import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';

import { CadastroDto } from './dto/cadastro.dto.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { Roles } from './decorators/roles.decorator.js';
import { RolesGuard } from './guards/roles.guard.js';

type UsuarioAutenticado = {
    sub: string;
    tipo: 'aluno' | 'docente';
};

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() dados: LoginDto) {
        return this.authService.login(
            dados.email,
            dados.senha,
        );
    }


    @Post('cadastro')
    cadastrar(@Body() dados: CadastroDto) {
        return this.authService.cadastrar(dados);
    }


    @Get('me')
    @UseGuards(JwtAuthGuard)
    obterUsuario(
        @Req() requisicao: { user: UsuarioAutenticado },
    ) {
        return requisicao.user;
    }

    @Get('area-docente')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('docente')
    areaDocente() {
        return {
            mensagem: 'Acesso autorizado para docente',
        };
    }
}