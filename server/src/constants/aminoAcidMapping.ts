/*
 * Maps each amino acid's 1 letter code to its corresponding 3 letter amino acid code
 */
const AMINO_ACID_MAPPING: Record<string, string> = {
  A: 'Ala', // Alanine
  C: 'Cys', // Cysteine
  D: 'Asp', // Aspartic acid
  E: 'Glu', // Glutamic acid
  F: 'Phe', // Phenylalanine
  G: 'Gly', // Glycine
  H: 'His', // Histidine
  I: 'Ile', // Isoleucine
  K: 'Lys', // Lysine
  L: 'Leu', // Leucine
  M: 'Met', // Methionine
  N: 'Asn', // Asparagine
  P: 'Pro', // Proline
  Q: 'Gln', // Glutamine
  R: 'Arg', // Arginine
  S: 'Ser', // Serine
  T: 'Thr', // Threonine
  V: 'Val', // Valine
  W: 'Trp', // Tryptophan
  Y: 'Tyr', // Tyrosine
};

export default AMINO_ACID_MAPPING;
