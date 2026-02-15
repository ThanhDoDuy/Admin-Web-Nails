'use client'

import { Badge } from '@/components/ui/badge'
import type { LoyaltyTier } from '@/lib/api-client'
import { Crown, Award, Medal, Star, User } from 'lucide-react'

const TIER_CONFIG: Record<LoyaltyTier, {
  label: string
  className: string
  icon: React.ElementType
}> = {
  new: {
    label: 'New',
    className: 'bg-gray-50 text-gray-600 border-gray-200',
    icon: User,
  },
  bronze: {
    label: 'Bronze',
    className: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: Medal,
  },
  silver: {
    label: 'Silver',
    className: 'bg-slate-50 text-slate-600 border-slate-300',
    icon: Award,
  },
  gold: {
    label: 'Gold',
    className: 'bg-amber-50 text-amber-700 border-amber-300',
    icon: Star,
  },
  platinum: {
    label: 'Platinum',
    className: 'bg-purple-50 text-purple-700 border-purple-300',
    icon: Crown,
  },
}

interface LoyaltyBadgeProps {
  tier: LoyaltyTier
  showIcon?: boolean
  size?: 'sm' | 'md'
}

export function LoyaltyBadge({ tier, showIcon = true, size = 'sm' }: LoyaltyBadgeProps) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.new
  const Icon = config.icon
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5'} gap-1`}
    >
      {showIcon && <Icon className={iconSize} />}
      {config.label}
    </Badge>
  )
}

export function getTierFromVisits(totalVisits: number): LoyaltyTier {
  if (totalVisits >= 21) return 'platinum'
  if (totalVisits >= 11) return 'gold'
  if (totalVisits >= 6) return 'silver'
  if (totalVisits >= 3) return 'bronze'
  return 'new'
}

// ── Tier requirements (shared data) ──────────────────────────

export interface TierRequirement {
  tier: LoyaltyTier
  label: string
  minVisits: number
  maxVisits: number | null // null = unlimited (platinum)
  color: string
  bgColor: string
  barColor: string
  icon: React.ElementType
}

export const TIER_REQUIREMENTS: TierRequirement[] = [
  { tier: 'new',      label: 'New',      minVisits: 0,  maxVisits: 2,    color: 'text-gray-600',   bgColor: 'bg-gray-50',   barColor: 'bg-gray-400',   icon: User },
  { tier: 'bronze',   label: 'Bronze',   minVisits: 3,  maxVisits: 5,    color: 'text-orange-700', bgColor: 'bg-orange-50',  barColor: 'bg-orange-400', icon: Medal },
  { tier: 'silver',   label: 'Silver',   minVisits: 6,  maxVisits: 10,   color: 'text-slate-600',  bgColor: 'bg-slate-50',   barColor: 'bg-slate-400',  icon: Award },
  { tier: 'gold',     label: 'Gold',     minVisits: 11, maxVisits: 20,   color: 'text-amber-700',  bgColor: 'bg-amber-50',   barColor: 'bg-amber-400',  icon: Star },
  { tier: 'platinum', label: 'Platinum', minVisits: 21, maxVisits: null,  color: 'text-purple-700', bgColor: 'bg-purple-50',  barColor: 'bg-purple-500', icon: Crown },
]

export function getNextTierInfo(totalVisits: number): {
  currentTier: TierRequirement
  nextTier: TierRequirement | null
  visitsToNext: number
  progress: number // 0-100
} {
  const tiers = TIER_REQUIREMENTS
  let currentIdx = 0
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (totalVisits >= tiers[i].minVisits) {
      currentIdx = i
      break
    }
  }

  const currentTier = tiers[currentIdx]
  const nextTier = currentIdx < tiers.length - 1 ? tiers[currentIdx + 1] : null

  if (!nextTier) {
    // Already at platinum
    return { currentTier, nextTier: null, visitsToNext: 0, progress: 100 }
  }

  const visitsToNext = nextTier.minVisits - totalVisits
  const rangeStart = currentTier.minVisits
  const rangeEnd = nextTier.minVisits
  const progress = Math.min(100, Math.round(((totalVisits - rangeStart) / (rangeEnd - rangeStart)) * 100))

  return { currentTier, nextTier, visitsToNext, progress }
}
