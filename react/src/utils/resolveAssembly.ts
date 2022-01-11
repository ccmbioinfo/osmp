import { AssemblyId } from '../types';

const resolveAssembly = (assembly: AssemblyId) =>
    assembly.includes('38') ? '38' : ('37' as const);

export default resolveAssembly;
