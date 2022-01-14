const resolveAssembly = (assembly: string) => (assembly.includes('38') ? 'GRCh38' : 'GRCh37');

export default resolveAssembly;
