export function computeDelta(before: any, after: any) {
  const delta: Record<string, any> = {};

  const allKeys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ]);

  for (const key of allKeys) {
    const oldVal = before?.[key];
    const newVal = after?.[key];
    if (JSON.stringify(oldVal) === JSON.stringify(newVal)) continue;

    delta[key] = {
      from: oldVal ?? null,
      to: newVal ?? null,
    };
  }

  // Return undefined if no changes
  return Object.keys(delta).length > 0 ? delta : undefined;
}
