export function useSalesKpis() {
  // Dummy data for User Dashboard Key Performance Indicators
  const data = {
    toBeIssuedCount: 1005,
    r105Count: 800,
    w105Count: 1202,
    f105Count: 500,
    dispatchedSoCount: 4100,
    totalSoCount: 800,
  };

  return {
    data,
    totalSoCount: data.totalSoCount,
    loading: false,
    error: null,
    refetch: () => {},
  };
}
