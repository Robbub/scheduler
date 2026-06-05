export function isWorkingDay(date: Date, holidayList: string[]): boolean {
  const dayOfWeek = date.getDay();

  if (dayOfWeek === 0 || dayOfWeek === 6) return false;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateString = `${year}-${month}-${day}`;

  return !holidayList.includes(dateString);
}

export function addWorkingDays(
  startDateStr: string | Date,
  workingDays: number,
  holidayList: string[],
): Date {
  const current = new Date(startDateStr);
  let remainingDays = workingDays;

  while (remainingDays > 0) {
    current.setDate(current.getDate() + 1);
    if (isWorkingDay(current, holidayList)) {
      remainingDays--;
    }
  }

  return current;
}

export function getCalendarGridDistance(
  startDate: Date,
  targetDate: Date,
  viewMode: "day" | "week" | "month",
): number {
  const diffTime = targetDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (viewMode == "week") return Math.floor(diffDays / 7);
  if (viewMode == "month") {
    return (
      (targetDate.getFullYear() - startDate.getFullYear()) * 12 +
      (targetDate.getMonth() - startDate.getMonth())
    );
  }
  return diffDays;
}
