interface DispatchSummaryData {
  ordersToBeDispatched: number;
  readyForDispatchToday: number;
  ordersDispatchedToday: number;
}

export function useDispatchSummary() {
  // Dummy data for Dispatch Summary
  const data: DispatchSummaryData = {
    ordersToBeDispatched: 102,
    readyForDispatchToday: 56,
    ordersDispatchedToday: 84,
  };

  return {
    data,
    loading: false,
    error: null,
    refetch: () => {},
  };
}
