const resolveChromosome = (position: string) => {
  const [chromosome, coordinates] = position.split(':');
  const [end, start] = coordinates.split('-');

  return {
    chromosome,
    start,
    end,
  };
};

export default resolveChromosome;
