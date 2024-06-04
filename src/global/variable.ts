export enum FilmRating {
  G = 'G',
  PG = 'PG',
  PG_13 = 'PG-13',
  R = 'R',
  NC_17 = 'NC-17',
}
export enum SortOptions {
  asc = 'asc',
  dsc = 'dsc',
}
export const minAgeForFilmRating = {
  [FilmRating.G]: 0,
  [FilmRating.PG]: 0,
  [FilmRating.PG_13]: 13,
  [FilmRating.R]: 17,
  [FilmRating.NC_17]: 18,
};
