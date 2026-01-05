
export function useStatsCards() {
  const data = {
    totalSoCount: 150,
    dispatchedSoCount: 120,
    overdueCount: 12
  };

  return {
    data,
    loading: false,
    error: null,
    refetch: () => {},
  };
}
