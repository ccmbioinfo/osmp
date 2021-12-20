const resolveChromosome = (position: string) => {
  const chromosome = position.split(':')[0];
  const coordinates = position.split(':')[1];
  const end = coordinates.split('-')[0];
  const start = coordinates.split('-')[1];

  return {
    chromosome,
    start,
    end,
  };
};

export default resolveChromosome;
