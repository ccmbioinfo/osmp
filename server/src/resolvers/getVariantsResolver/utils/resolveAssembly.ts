const resolveAssembly = (assembly: string) => {
  if (assembly.includes('37') || assembly.toLowerCase().includes('hg19')) {
    return 'gnomAD_GRCh37';
  } else if (assembly.includes('38')) {
    return '38';
  } else {
    return '';
  }
};

export default resolveAssembly;