const SENSITIVE_KEYS = [
  'token',
  'access_token',
  'refresh_token',
  'authorization',
  'password',
  'secret',
  'card',
  'cvv',
  'payment',
];

const MAX_DEPTH = 5;

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const shouldRedact = (key: string): boolean => {
  const lower = key.toLowerCase();
  return SENSITIVE_KEYS.some((sensitive) => lower.includes(sensitive));
};

export const redactSensitiveData = (input: unknown, depth = 0): unknown => {
  if (depth > MAX_DEPTH) {
    return '[MaxDepth]';
  }

  if (Array.isArray(input)) {
    return input.map((item) => redactSensitiveData(item, depth + 1));
  }

  if (!isObject(input)) {
    return input;
  }

  const output: Record<string, unknown> = {};
  Object.entries(input).forEach(([key, value]) => {
    output[key] = shouldRedact(key) ? '[REDACTED]' : redactSensitiveData(value, depth + 1);
  });

  return output;
};
