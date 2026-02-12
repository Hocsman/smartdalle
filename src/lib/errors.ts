// Codes d'erreur standardisés
export const ErrorCodes = {
  // Auth
  UNAUTHORIZED: 'UNAUTHORIZED',
  PREMIUM_REQUIRED: 'PREMIUM_REQUIRED',
  PROFILE_NOT_FOUND: 'PROFILE_NOT_FOUND',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // AI
  AI_NO_RESPONSE: 'AI_NO_RESPONSE',
  AI_INVALID_JSON: 'AI_INVALID_JSON',
  AI_GENERATION_FAILED: 'AI_GENERATION_FAILED',

  // Database
  DB_INSERT_FAILED: 'DB_INSERT_FAILED',
  DB_UPDATE_FAILED: 'DB_UPDATE_FAILED',
  DB_DELETE_FAILED: 'DB_DELETE_FAILED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // Generic
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// Messages user-friendly en français
export const ErrorMessages: Record<ErrorCode, string> = {
  UNAUTHORIZED: 'Tu dois être connecté pour faire ça',
  PREMIUM_REQUIRED: 'Cette fonctionnalité est réservée aux membres Premium',
  PROFILE_NOT_FOUND: 'Profil introuvable. Complète ton onboarding',
  RATE_LIMIT_EXCEEDED: 'Trop de requêtes. Patiente un peu !',
  AI_NO_RESPONSE: 'Le chef est en pause. Réessaie dans un instant',
  AI_INVALID_JSON: 'Réponse inattendue. Réessaie',
  AI_GENERATION_FAILED: 'La génération a échoué. Réessaie',
  DB_INSERT_FAILED: 'Erreur lors de la sauvegarde',
  DB_UPDATE_FAILED: 'Erreur lors de la mise à jour',
  DB_DELETE_FAILED: 'Erreur lors de la suppression',
  VALIDATION_ERROR: 'Données invalides',
  UNKNOWN_ERROR: 'Une erreur est survenue',
};

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message?: string,
    public meta?: Record<string, unknown>
  ) {
    super(message || ErrorMessages[code]);
    this.name = 'AppError';
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      meta: this.meta,
    };
  }
}

// Helper pour obtenir un message user-friendly depuis n'importe quelle erreur
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    // Vérifier les patterns d'erreur connus
    if (error.message.includes('premium')) return ErrorMessages.PREMIUM_REQUIRED;
    if (error.message.includes('Unauthorized')) return ErrorMessages.UNAUTHORIZED;
    if (error.message.includes('rate') || error.message.includes('limit')) return ErrorMessages.RATE_LIMIT_EXCEEDED;
    return error.message;
  }
  return ErrorMessages.UNKNOWN_ERROR;
}
