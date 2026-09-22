import { Test, TestingModule } from '@nestjs/testing';
import { ObjetosController } from './objetos.controller';
import { ObjetosRepositoryService } from './objetos-repository/objetos-repository.service';

describe('ObjetosController', () => {
  let controller: ObjetosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObjetosController],
      providers: [ObjetosRepositoryService],
    }).compile();

    controller = module.get<ObjetosController>(ObjetosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});