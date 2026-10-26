import {
  ArrowRight,
  ArrowUUpLeft,
  BellRinging,
  BookmarkSimple,
  Briefcase,
  CalendarDots,
  ChatCircleDots,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Hourglass,
  PaperPlaneTilt,
  Sparkle,
  Star,
  UserCircle,
  XCircle,
  type IconProps,
} from "@phosphor-icons/react";

export type DashboardIconName =
  | "ArrowRight"
  | "ArrowUUpLeft"
  | "BellRinging"
  | "BookmarkSimple"
  | "Briefcase"
  | "CalendarDots"
  | "ChatCircleDots"
  | "CheckCircle"
  | "Clock"
  | "Eye"
  | "FileText"
  | "Hourglass"
  | "PaperPlaneTilt"
  | "Sparkle"
  | "Star"
  | "UserCircle"
  | "XCircle";

const icons = {
  ArrowRight,
  ArrowUUpLeft,
  BellRinging,
  BookmarkSimple,
  Briefcase,
  CalendarDots,
  ChatCircleDots,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Hourglass,
  PaperPlaneTilt,
  Sparkle,
  Star,
  UserCircle,
  XCircle,
} satisfies Record<DashboardIconName, React.ComponentType<IconProps>>;

interface DashboardIconProps {
  name: DashboardIconName;
  size?: number;
  weight?: IconProps["weight"];
  className?: string;
}

export function DashboardIcon({
  name,
  size = 22,
  weight = "duotone",
  className,
}: DashboardIconProps) {
  const Icon = icons[name];
  return <Icon size={size} weight={weight} className={className} aria-hidden="true" />;
}
