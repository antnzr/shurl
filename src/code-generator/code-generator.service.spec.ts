/// <reference types="jest" />
import { Service } from '../constants';
import { redisMock } from '../../test/mocks';
import { ICodeGeneratorService } from './interfaces';
import { APP_TestingModule, TestApp } from '../../test/test.module';

describe('ICodeGeneratorService', () => {
  let service: ICodeGeneratorService;
  let app: TestApp;

  beforeAll(async () => {
    app = await APP_TestingModule({ providers: [redisMock] });
    service = app.get<ICodeGeneratorService>(Service.CODE_GENERATOR);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('generateCode', () => {
    it('should generate code with default length 7', () => {
      const code = service.generateCode();

      expect(code).toHaveLength(7);
    });
    it('should contain only Base62 characters', () => {
      const code = service.generateCode();

      const base62Regex = /^[a-zA-Z0-9]+$/;

      expect(base62Regex.test(code)).toBe(true);
    });
    it('should generate code with custom length', () => {
      const code = service.generateCode(10);

      expect(code).toHaveLength(10);
    });
    it('should generate different codes', () => {
      const code1 = service.generateCode();
      const code2 = service.generateCode();

      expect(code1).not.toEqual(code2);
    });
    it('should have low collision probability', () => {
      const set = new Set<string>();

      for (let i = 0; i < 10000; i++) {
        set.add(service.generateCode());
      }

      expect(set.size).toBeGreaterThan(9900);
    });
    it('should return empty string if length = 0', () => {
      const code = service.generateCode(0);

      expect(code).toBe('');
    });
    it('should support large length', () => {
      const code = service.generateCode(50);

      expect(code).toHaveLength(50);
    });
  });
});
