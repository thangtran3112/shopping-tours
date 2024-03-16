export enum ExcludedParams {
  SORT = 'sort',
  LIMIT = 'limit',
  PAGE = 'page',
  FIELDS = 'fields',
}
export const ExcludedFields = Object.values(ExcludedParams) as ExcludedParams[];
