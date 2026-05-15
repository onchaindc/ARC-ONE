import {
  ArrowDownLeft,
  BadgeDollarSign,
  Bot,
  CreditCard,
  LineChart,
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
