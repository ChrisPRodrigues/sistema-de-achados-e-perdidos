import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { QueryFailedError, Repository } from 'typeorm';
import { CadastroDto } from './dto/cadastro.dto.js';

import { UsuarioEntity } from '../usuarios/entities/usuario.entity.js';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UsuarioEntity)
        private readonly usuariosRepository: Repository<UsuarioEntity>,

        private readonly jwtService: JwtService,
    ) { }

    async buscarUsuarioParaLogin(
        email: string,
    ): Promise<UsuarioEntity | null> {
        return this.usuariosRepository
            .createQueryBuilder('usuario')
            .addSelect('usuario.senhaHash')
            .where('LOWER(usuario.email) = LOWER(:email)', { email })
            .getOne();
    }

    async validarCredenciais(
        email: string,
        senha: string,
    ): Promise<UsuarioEntity> {
        const usuario = await this.buscarUsuarioParaLogin(email);

        if (!usuario?.senhaHash) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const senhaCorreta = await compare(senha, usuario.senhaHash);

        if (!senhaCorreta) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        return usuario;
    }

    async login(email: string, senha: string) {
        const usuario = await this.validarCredenciais(email, senha);

        const payload = {
            sub: usuario.id,
            tipo: usuario.tipo,
        };

        const access_token = await this.jwtService.signAsync(payload);

        return {
            access_token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo,
            },
        };
    }

    async cadastrar(dados: CadastroDto) {
        const nome = dados.nome.trim();
        const email = dados.email.trim().toLowerCase();

        const usuarioExistente = await this.usuariosRepository
            .createQueryBuilder('usuario')
            .where('LOWER(usuario.email) = :email', { email })
            .getOne();

        if (usuarioExistente) {
            throw new ConflictException(
                'Já existe um usuário com esse e-mail',
            );
        }

        const senhaHash = await hash(dados.senha, 12);

        const novoUsuario = this.usuariosRepository.create({
            nome,
            email,
            senhaHash,
            tipo: 'aluno',
        });

        try {
            const usuario = await this.usuariosRepository.save(novoUsuario);

            return {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo,
            };
        } catch (erro) {
            if (
                erro instanceof QueryFailedError &&
                (erro.driverError as { code?: string }).code === '23505'
            ) {
                throw new ConflictException(
                    'Já existe um usuário com esse e-mail',
                );
            }

            throw erro;
        }
    }
}