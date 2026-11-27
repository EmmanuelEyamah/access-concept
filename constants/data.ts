import type { BrandKey } from "@/constants/assets";
import type { Recipient, Transaction } from "@/types/bank";

// Everything here is made up. No real account, balance or person's banking details appear in this concept,
// and the faces are generated, not photographs of real people.
export const USER = { first: "Emmanuel", name: "Emmanuel Eyamah", tier: "Tier 3", account: "0098 765 432", product: "Premier Savings" } as const;

export const OPENING_BALANCE = 1284650.75;
export const TRANSFER_FEE = 10.75;
export const DAILY_LIMIT = 1000000;
export const MONTH_IN = 695000;
export const MONTH_OUT = 187650;

export const RECIPIENTS: Recipient[] = [
  { id: "r1", name: "Adaeze Okafor", bank: "GTBank", brand: "gtbank", person: "adaeze", account: "0234 118 907" },
  { id: "r2", name: "Tunde Bakare", bank: "OPay", brand: "opay", person: "tunde", account: "8031 224 765" },
  { id: "r3", name: "Halima Yusuf", bank: "Access Bank", brand: "access", person: "halima", account: "0712 660 341" },
  { id: "r4", name: "Chidi Nwosu", bank: "Kuda", brand: "kuda", person: "chidi", account: "2011 908 455" },
  { id: "r5", name: "Ife Adeyemi", bank: "Zenith Bank", brand: "zenith", person: "ife", account: "1004 772 019" },
  { id: "r6", name: "Blessing Etim", bank: "UBA", brand: "uba", person: "blessing", account: "2087 331 640" },
];

export const TRANSACTIONS: Transaction[] = [
  { id: "t1", title: "Chowdeck", note: "Food delivery", amount: 8450, kind: "out", category: "card", brand: "chowdeck", daysAgo: 0, time: "12:41" },
  { id: "t2", title: "Halima Yusuf", note: "Sent you money", amount: 75000, kind: "in", category: "transfer", person: "halima", daysAgo: 0, time: "09:15" },
  { id: "t3", title: "MTN", note: "Airtime top-up", amount: 2000, kind: "out", category: "airtime", brand: "mtn", daysAgo: 1, time: "19:02" },
  { id: "t4", title: "Netflix", note: "Card ending 4821", amount: 5500, kind: "out", category: "card", brand: "netflix", daysAgo: 1, time: "00:12" },
  { id: "t5", title: "Moniepoint", note: "Salary, November", amount: 620000, kind: "in", category: "income", brand: "moniepoint", daysAgo: 2, time: "07:00" },
  { id: "t6", title: "Tunde Bakare", note: "You sent money", amount: 40000, kind: "out", category: "transfer", person: "tunde", daysAgo: 4, time: "16:48" },
  { id: "t7", title: "DStv", note: "Compact plan", amount: 19000, kind: "out", category: "bills", brand: "dstv", daysAgo: 6, time: "11:20" },
  { id: "t8", title: "Bolt", note: "Ride to Victoria Island", amount: 6200, kind: "out", category: "card", brand: "bolt", daysAgo: 9, time: "08:05" },
  { id: "t9", title: "Eko Electric", note: "Prepaid meter", amount: 15000, kind: "out", category: "bills", brand: "ekedc", daysAgo: 14, time: "18:30" },
  { id: "t10", title: "Adaeze Okafor", note: "You sent money", amount: 25000, kind: "out", category: "transfer", person: "adaeze", daysAgo: 19, time: "13:10" },
  { id: "t11", title: "Airtel", note: "Data bundle", amount: 3500, kind: "out", category: "airtime", brand: "airtel", daysAgo: 23, time: "21:44" },
  { id: "t12", title: "Moniepoint", note: "Salary, October", amount: 620000, kind: "in", category: "income", brand: "moniepoint", daysAgo: 32, time: "07:00" },
  { id: "t13", title: "Jumia", note: "Card ending 4821", amount: 48900, kind: "out", category: "card", brand: "jumia", daysAgo: 36, time: "15:22" },
  { id: "t14", title: "Spotify", note: "Premium, monthly", amount: 1300, kind: "out", category: "card", brand: "spotify", daysAgo: 41, time: "06:00" },
  { id: "t15", title: "Chidi Nwosu", note: "Sent you money", amount: 12000, kind: "in", category: "transfer", person: "chidi", daysAgo: 48, time: "10:37" },
  { id: "t16", title: "GOtv", note: "Jolli plan", amount: 4850, kind: "out", category: "bills", brand: "gotv", daysAgo: 95, time: "12:00" },
  { id: "t17", title: "Ife Adeyemi", note: "You sent money", amount: 60000, kind: "out", category: "transfer", person: "ife", daysAgo: 210, time: "17:15" },
];

export const WEEK_SPEND = [12400, 31800, 8200, 44500, 21000, 52300, 17450] as const;

// The twelve services the real home screen shows as tiles: all kept, just moved one tap away.
export const SERVICES = ["Rewards", "BreezePay", "Access transfers", "Other banks", "Mobile top-up", "Sport wallet", "Bill payment", "Intl. airtime", "Loans", "Investments", "Loyalty+", "History"] as const;

export const QUICK_AMOUNTS = [5000, 10000, 20000, 50000] as const;

export const ONBOARDING = [
  { key: "woman", title: "Your money,\nfront and centre.", body: "Your balance is the first thing you see. No menus to dig through." },
  { key: "shop", title: "Send in\nthree taps.", body: "Pick a person, enter the amount, slide to send. That is the whole thing." },
  { key: "friends", title: "Always know\nwhat happened.", body: "A clear receipt every time. And if a transfer fails, a clear answer about your money." },
] as const;

/** EXPO_PUBLIC_AUTOPILOT: "1" sends money end to end, "fail" ends on the failed screen, "tour" walks the tabs, "shots" stops on every page. */
export const AUTOPILOT = process.env.EXPO_PUBLIC_AUTOPILOT ?? "";


export const BANKS: { name: string; brand: BrandKey }[] = [
  { name: "Access Bank", brand: "access" },
  { name: "GTBank", brand: "gtbank" },
  { name: "Zenith Bank", brand: "zenith" },
  { name: "UBA", brand: "uba" },
  { name: "Fidelity Bank", brand: "fidelity" },
  { name: "Wema Bank", brand: "wema" },
  { name: "Union Bank", brand: "union" },
  { name: "Kuda", brand: "kuda" },
  { name: "OPay", brand: "opay" },
  { name: "PalmPay", brand: "palmpay" },
  { name: "Moniepoint", brand: "moniepoint" },
];

// Number prefixes per network. A hint only: numbers can be ported, so the choice stays editable.
export const NETWORKS: { name: string; brand: BrandKey; prefixes: string[] }[] = [
  { name: "MTN", brand: "mtn", prefixes: ["0703", "0704", "0706", "0803", "0806", "0810", "0813", "0814", "0816", "0903", "0906", "0913", "0916"] },
  { name: "Airtel", brand: "airtel", prefixes: ["0701", "0708", "0802", "0808", "0812", "0901", "0902", "0904", "0907", "0911", "0912"] },
  { name: "Glo", brand: "glo", prefixes: ["0705", "0805", "0807", "0811", "0815", "0905", "0915"] },
  { name: "9mobile", brand: "ninemobile", prefixes: ["0809", "0817", "0818", "0908", "0909"] },
];

export const AIRTIME_AMOUNTS = [100, 200, 500, 1000, 2000, 5000] as const;
export const MY_NUMBER = "0803 555 0142";

export const PERIODS = [
  { label: "Any time", from: 0, to: 100000 },
  { label: "Today", from: 0, to: 0 },
  { label: "Last 7 days", from: 0, to: 7 },
  { label: "Last 30 days", from: 0, to: 30 },
  { label: "This month", from: 0, to: 26 },
  { label: "Last month", from: 27, to: 57 },
  { label: "This year", from: 0, to: 330 },
] as const;

export const TX_CATEGORIES = [
  { key: "transfer", label: "Transfers" },
  { key: "bills", label: "Bills" },
  { key: "card", label: "Card payments" },
  { key: "airtime", label: "Airtime and data" },
  { key: "income", label: "Income" },
] as const;

export const BILL_CATEGORIES = ["Airtime", "Data", "Electricity", "TV", "Internet", "Transport", "Shopping", "More"] as const;

export const BILLERS: { name: string; note: string; brand: BrandKey }[] = [
  { name: "DStv", note: "TV subscription", brand: "dstv" },
  { name: "GOtv", note: "TV subscription", brand: "gotv" },
  { name: "Eko Electric", note: "Prepaid and postpaid", brand: "ekedc" },
  { name: "Netflix", note: "Streaming", brand: "netflix" },
  { name: "Spotify", note: "Music", brand: "spotify" },
  { name: "Showmax", note: "Streaming", brand: "showmax" },
  { name: "Bolt", note: "Ride balance", brand: "bolt" },
  { name: "Jumia", note: "Shopping", brand: "jumia" },
];

export const CARD_PIN = "4821";
export const CARD_LIMIT = { spent: 348500, limit: 500000 } as const;

export const NOTICES: { id: string; title: string; body: string; time: string; group: "Today" | "Earlier"; brand?: BrandKey; unread?: boolean; kind: "money" | "security" | "card" | "offer" }[] = [
  { id: "n1", title: "₦75,000 received", body: "Halima Yusuf sent you money.", time: "09:15", group: "Today", unread: true, kind: "money" },
  { id: "n2", title: "Chowdeck payment", body: "₦8,450 paid with your card ending 4821.", time: "12:41", group: "Today", brand: "chowdeck", unread: true, kind: "card" },
  { id: "n3", title: "New sign-in", body: "Your account was opened on this iPhone.", time: "09:14", group: "Today", kind: "security" },
  { id: "n4", title: "Salary received", body: "₦620,000 from Moniepoint.", time: "Tue", group: "Earlier", brand: "moniepoint", kind: "money" },
  { id: "n5", title: "DStv is due in 3 days", body: "Renew Compact for ₦19,000 before it lapses.", time: "Mon", group: "Earlier", brand: "dstv", kind: "offer" },
  { id: "n6", title: "Card limit at 70%", body: "You have spent ₦348,500 of ₦500,000 this month.", time: "Sun", group: "Earlier", kind: "card" },
];
