export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...reviewKeys.lists(), { filters }] as const,
  byProduct: (productId: string) => [...reviewKeys.lists(), { productId }] as const,
  details: () => [...reviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...reviewKeys.details(), id] as const,
};
