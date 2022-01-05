const resolveChromosome = (position: string) => {
  const [chromosome, coordinates] = position.split(':');
  const [start, end] = coordinates.split('-');

  return {
    chromosome,
    start,
    end,
  };
};

export default resolveChromosome;
