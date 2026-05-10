const isNonEmpty = (value: string | undefined | null): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
}

export const validateEnv = (
  env: Record<string, string | undefined>,
  requiredKeys: string[],
): EnvValidationResult => {
  const missing = requiredKeys.filter((key) => !isNonEmpty(env[key]));
  return {
    valid: missing.length === 0,
    missing,
  };
};
