/** 1284650.75 → "1,284,650.75" */
export const naira = (value: number, decimals = 2) => value.toLocaleString("en-NG", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export const dayLabel = (daysAgo: number) => (daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`);
