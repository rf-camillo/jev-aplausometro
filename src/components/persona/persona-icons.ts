import {
  Briefcase,
  Code,
  GraduationCap,
  Heart,
  HeartHandshake,
  type LucideIcon,
  Megaphone,
  MessageCircle,
  Palette,
  Rocket,
  Search,
  SquareKanban,
  TrendingUp,
} from "lucide-react";

import type { PersonaId } from "@/lib/audience/personas";

const PERSONA_ICONS: Record<PersonaId, LucideIcon> = {
  recruiter: Search,
  senior_dev: Code,
  junior_dev: GraduationCap,
  founder: Rocket,
  investor: TrendingUp,
  hr_manager: HeartHandshake,
  product_manager: SquareKanban,
  designer: Palette,
  client: Briefcase,
  uncle: MessageCircle,
  mom: Heart,
  coach: Megaphone,
};

export function personaIcon(id: PersonaId): LucideIcon {
  return PERSONA_ICONS[id];
}
