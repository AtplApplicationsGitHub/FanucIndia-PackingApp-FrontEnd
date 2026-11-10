import type { Dayjs } from "dayjs";

export function getCycleCountRangeError(from: Dayjs | null, to: Dayjs | null): string {
  if ((from && !from.isValid()) || (to && !to.isValid())) return "Enter valid FROM and TO dates";
  if (!from || !to) return "";
  if (to.isBefore(from, "day")) return "TO date cannot be before FROM date";
  if (to.isAfter(from.add(1, "month"), "day")) return "Date range cannot be more than one calendar month";
  return "";
}

export function getCycleCountDateBounds(from: Dayjs | null, to: Dayjs | null) {
  const validFrom = from?.isValid() ? from : undefined;
  const validTo = to?.isValid() ? to : undefined;
  let fromMin = validTo?.subtract(1, "month");
  if (fromMin && validTo && fromMin.add(1, "month").isBefore(validTo, "day")) {
    fromMin = fromMin.add(1, "day");
  }
  return {
    fromMin,
    fromMax: validTo,
    toMin: validFrom,
    toMax: validFrom?.add(1, "month"),
  };
}
