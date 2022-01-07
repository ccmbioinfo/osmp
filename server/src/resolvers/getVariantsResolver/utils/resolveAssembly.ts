import { AssemblyId } from '../../../types';

const resolveAssembly: (assembly: string) => AssemblyId = assembly =>
  assembly.includes('38') ? '38' : '37';

export default resolveAssembly;
