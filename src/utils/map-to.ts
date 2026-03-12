import { ClassConstructor, plainToInstance } from 'class-transformer';

export function mapTo<T>(cls: ClassConstructor<T>, entity: object): T {
  return plainToInstance(cls, entity, {
    strategy: 'excludeAll',
    exposeUnsetFields: false,
  });
}
