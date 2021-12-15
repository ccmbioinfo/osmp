const resolveChromosome = (position: string) => {
  const chromosome = position.match(/^[^:]*[^ :]/gm)?.join('');
  const coordinates = position.match(/\w[^:]*$/gm)?.join('');
  const end = coordinates?.match(/\w[^-]*$/gm);
  const start = coordinates?.match(/^[^-]*[^ -]/gm);

  return {
    chromosome,
    start,
    end,
  };
};

export default resolveChromosome;
