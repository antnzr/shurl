import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ICodeGeneratorService } from './interfaces';
import { DEFAULT_CODE_LENGTH } from '../constants';

const ALPHABET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

@Injectable()
export class CodeGeneratorService implements ICodeGeneratorService {
  /**
   * Generates a random short code of the specified length
   * using a secure random number generator.
   * @param length 7 by default
   * @returns {string}
   */
  generateCode(length: number = DEFAULT_CODE_LENGTH): string {
    const bytes = randomBytes(length);

    let result = '';

    for (let i = 0; i < length; i++) {
      result += ALPHABET[bytes[i] % ALPHABET.length];
    }

    return result;
  }
}
