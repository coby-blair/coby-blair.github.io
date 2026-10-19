export const roadmapStorageKey = 'coby:token-tips:progress:v1';

interface SavedProgress {
  version: 1;
  completed: string[];
}

type ProgressResult =
  | { valid: true; completed: Set<string> }
  | { valid: false; completed: Set<string> };

export function readProgress(value: string | null, allowedIds: readonly string[]): ProgressResult {
  if (value === null) return { valid: true, completed: new Set() };
  let saved: unknown;
  try {
    saved = JSON.parse(value);
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    return { valid: false, completed: new Set() };
  }
  if (
    typeof saved !== 'object' || saved === null ||
    !('version' in saved) || saved.version !== 1 ||
    !('completed' in saved) || !Array.isArray(saved.completed) ||
    !saved.completed.every((id): id is string => typeof id === 'string')
  ) {
    return { valid: false, completed: new Set() };
  }
  return {
    valid: true,
    completed: new Set(saved.completed.filter((id) => allowedIds.includes(id))),
  };
}

export function writeProgress(completed: ReadonlySet<string>): string {
  const saved: SavedProgress = { version: 1, completed: [...completed] };
  return JSON.stringify(saved);
}
