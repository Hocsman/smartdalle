import { SupabaseClient } from '@supabase/supabase-js';

export type RateLimitAction =
  | 'recipe_generation'    // gpt-4o-mini recipe generation
  | 'image_generation'     // dall-e-3 (most expensive)
  | 'anti_waste';          // gpt-4o-mini anti-waste suggestions

// Rate limits par action (requêtes par heure) - Version stricte
const RATE_LIMITS: Record<RateLimitAction, { free: number; premium: number }> = {
  recipe_generation: { free: 0, premium: 10 },   // Premium only, 10/hour
  image_generation: { free: 0, premium: 3 },     // Premium only, 3/hour (expensive)
  anti_waste: { free: 0, premium: 5 },           // Premium only, 5/hour
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  limit: number;
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public remaining: number,
    public resetAt: Date
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string,
  action: RateLimitAction,
  isPremium: boolean
): Promise<RateLimitResult> {
  const limit = isPremium ? RATE_LIMITS[action].premium : RATE_LIMITS[action].free;

  // Si limite = 0, pas autorisé (non-premium sur feature premium)
  if (limit === 0) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(),
      limit: 0,
    };
  }

  // Fenêtre d'une heure
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const resetAt = new Date(Date.now() + 60 * 60 * 1000);

  // Compter les requêtes dans la fenêtre actuelle
  const { count, error } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action_type', action)
    .gte('created_at', oneHourAgo.toISOString());

  if (error) {
    console.error('Rate limit check error:', error);
    // En cas d'erreur, on autorise (fail open) pour ne pas bloquer l'utilisateur
    return { allowed: true, remaining: limit, resetAt, limit };
  }

  const currentCount = count || 0;
  const remaining = Math.max(0, limit - currentCount);
  const allowed = currentCount < limit;

  return { allowed, remaining, resetAt, limit };
}

export async function incrementRateLimit(
  supabase: SupabaseClient,
  userId: string,
  action: RateLimitAction
): Promise<void> {
  const { error } = await supabase.from('rate_limits').insert({
    user_id: userId,
    action_type: action,
  });

  if (error) {
    console.error('Rate limit increment error:', error);
    // On ne throw pas pour ne pas bloquer l'action principale
  }
}

// Helper pour formater le message d'erreur
export function formatRateLimitError(resetAt: Date): string {
  const now = new Date();
  const diffMinutes = Math.ceil((resetAt.getTime() - now.getTime()) / (60 * 1000));

  if (diffMinutes <= 1) {
    return "Limite atteinte. Réessaie dans 1 minute.";
  } else if (diffMinutes < 60) {
    return `Limite atteinte. Réessaie dans ${diffMinutes} minutes.`;
  } else {
    return `Limite atteinte. Réessaie dans 1 heure.`;
  }
}
