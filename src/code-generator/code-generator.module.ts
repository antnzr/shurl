import { Module, Provider } from '@nestjs/common';
import { CodeGeneratorService } from './code-generator.service';
import { Service } from '../constants';

export const codeGeneratorProvider: Provider = {
  provide: Service.CODE_GENERATOR,
  useClass: CodeGeneratorService,
};

@Module({
  providers: [codeGeneratorProvider],
  exports: [codeGeneratorProvider],
})
export class CodeGeneratorModule {}
