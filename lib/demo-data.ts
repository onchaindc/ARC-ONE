import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeDollarSign,
  Bitcoin,
  Bot,
  CircleDollarSign,
  CreditCard,
  Gem,
  Landmark,
  LineChart,
  ReceiptText,
  Repeat2,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards
} from "lucide-react";

export const navItems = [
  { id: "home", label: "Home", icon: WalletCards },
  { id: "pay", label: "Pay", icon: CreditCard },
  { id: "trade", label: "Trade", icon: LineChart },
  { id: "ai", label: "AI", icon: Bot },
  { id: "profile", label: "Profile", icon: UserRound }
] as const;

export type NavId = (typeof navItems)[number]["id"];

export const quickActions = [
  { label: "Send", icon: Send, tone: "blue" },
  { label: "Receive", icon: ArrowDownLeft, tone: "green" },
  { label: "Swap", icon: Repeat2, tone: "purple" },
  { label: "Pay Merchant", icon: BadgeDollarSign, tone: "white" }
];

export const assets = [
  { symbol: "USDC", name: "USD Coin", amount: "2,450.00", value: 2450, change: 0.03, icon: CircleDollarSign },
  { symbol: "ETH", name: "Ethereum", amount: "1.42", value: 4636, change: 2.64, icon: Gem },
  { symbol: "WBTC", name: "Wrapped Bitcoin", amount: "0.12", value: 12269, change: -0.87, icon: Bitcoin },
  { symbol: "EURC", name: "Euro Coin", amount: "680.00", value: 738, change: 0.18, icon: Landmark }
];

export const activities = [
  { title: "Sent payment", subtitle: "42 USDC to @alex", amount: "-$42.00", icon: ArrowUpRight, status: "Confirmed" },
  { title: "Swap completed", subtitle: "0.08 ETH to 260.91 USDC", amount: "+$260.91", icon: Repeat2, status: "Final" },
  { title: "Deposit pending", subtitle: "Arc bridge settlement", amount: "$1,200.00", icon: ArrowDownLeft, status: "Pending" },
  { title: "Invoice paid", subtitle: "Merchant checkout #A1-2048", amount: "-$89.00", icon: ReceiptText, status: "Paid" }
];

export const markets = [
  { symbol: "BTC", price: "$102,240", change: 1.8 },
  { symbol: "ETH", price: "$3,265", change: 2.6 },
  { symbol: "SOL", price: "$188.42", change: -0.7 }
];

export const banners = [
  { title: "Earn vaults are warming up", body: "Automated USDC strategies arrive soon.", badge: "Early Access" },
  { title: "Smart subscriptions", body: "Approve recurring crypto payments with one clean control.", badge: "Coming Soon" },
  { title: "Refer friends", body: "Invite your network and unlock launch rewards.", badge: "Beta" }
];

export const roadmap = [
  "Earn Vaults",
  "Auto Yield",
  "Group Treasuries",
  "Smart Subscriptions",
  "Limit Orders",
  "Fiat Card",
  "Crossborder Payroll"
];

export const trustItems = [
  { label: "Secure transaction", icon: ShieldCheck },
  { label: "Powered by Arc Testnet", icon: Sparkles },
  { label: "Non-custodial", icon: WalletCards }
];
