
export function useUserOrderImports() {
  const data = [
    {
      id: 105,
      label: "Today",
      date: "2026-01-05",
      count: 1,
      abbr: "Tod",
      type: "today",
    },
    {
      id: 2,
      label: "Yesterday",
      date: "2026-01-04",
      count: 0,
      abbr: "Yes",
      type: "yesterday",
    },
    {
      id: 3,
      label: "Jan 3",
      date: "2026-01-03",
      count: 0,
      abbr: "Jan",
      type: "past",
    },
    {
      id: 4,
      label: "Jan 2",
      date: "2026-01-02",
      count: 12,
      abbr: "Jan",
      type: "past",
    },
    {
      id: 5,
      label: "Jan 1",
      date: "2026-01-01",
      count: 0,
      abbr: "Jan",
      type: "past",
    },
  ];

  return {
    data,
    loading: false,
    error: null,
    refetch: () => {},
  };
}
