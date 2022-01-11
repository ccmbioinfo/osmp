import { AssemblyId } from '../../../types';

const resolveAssembly = (assembly: string) =>
  assembly.includes('38') ? '38' : '37' as AssemblyId;

export default resolveAssembly;
