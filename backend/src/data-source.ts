
import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { UsuarioEntity } from './usuarios/entities/usuario.entity.js';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [UsuarioEntity],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
