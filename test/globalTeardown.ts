import 'tsconfig-paths/register';
import { TestInfra } from './infra';

module.exports = async () => {
  const testInfra = TestInfra.getInstance();
  await testInfra.down();
};
