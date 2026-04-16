import {
  Max,
  Min,
  IsEnum,
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  validateSync,
} from 'class-validator';
import { Environment } from '../constants';
import { plainToInstance } from 'class-transformer';

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV!: Environment;

  @IsNumber()
  @Min(3000)
  @Max(7000)
  @IsOptional()
  PORT: number = 3007;

  @IsString()
  @IsOptional()
  ADDR: string = '0.0.0.0';

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  REDIS_URL!: string;
}

export default (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const message = errors
      .map((error) => {
        const constraints = error.constraints;
        return constraints ? Object.values(constraints).join(', ') : '';
      })
      .filter(Boolean)
      .join(', ');
    throw new Error(message);
  }

  return validatedConfig;
};
