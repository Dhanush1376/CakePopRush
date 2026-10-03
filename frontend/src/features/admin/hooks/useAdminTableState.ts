import { useState, useMemo, useEffect } from 'react';

interface UseAdminTableStateConfig<T> {
  data: T[];
  searchFields: (keyof T)[];
  filterFns?: Record<string, (item: T, value: string) => boolean>;
  defaultPageSize?: number;
}

export function useAdminTableState<T>({
  data,
  searchFields,
  filterFns = {},
  defaultPageSize = 10,
}: UseAdminTableStateConfig<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = defaultPageSize;

  // Set filter value
  const setFilter = (key: string, value: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (value === 'all') {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      return newFilters;
    });
    setCurrentPage(1); // Reset page on filter change
  };

  // Reset all
  const resetAll = () => {
    setSearchTerm('');
    setActiveFilters({});
    setCurrentPage(1);
  };

  // Compute filtered data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // 1. Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesSearch = searchFields.some(field => {
          const val = item[field];
          if (val == null) return false;
          return String(val).toLowerCase().includes(query);
        });
        if (!matchesSearch) return false;
      }

      // 2. Filters
      for (const [key, value] of Object.entries(activeFilters)) {
        if (filterFns[key]) {
          if (!filterFns[key](item, value)) return false;
        } else {
          // Default exact match if no custom function provided
          const itemVal = item[key as keyof T];
          if (String(itemVal).toLowerCase() !== value.toLowerCase()) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, searchTerm, activeFilters, searchFields, filterFns]);

  // Compute pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Reset to page 1 if data changes and we're out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const showingStart = filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const showingEnd = Math.min(currentPage * pageSize, filteredData.length);
  const totalItems = filteredData.length;
  
  // Format: "Showing 1 to 10 of 42"
  const pageInfo = `Showing ${showingStart} to ${showingEnd} of ${totalItems}`;

  return {
    searchTerm,
    setSearchTerm: (term: string) => {
      setSearchTerm(term);
      setCurrentPage(1);
    },
    activeFilters,
    setFilter,
    filteredData,
    paginatedData,
    currentPage,
    setCurrentPage,
    totalPages,
    pageInfo,
    resetAll,
    totalItems,
  };
}
