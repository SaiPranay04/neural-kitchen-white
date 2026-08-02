export function log(scope: string, event: string, meta?: Record<string, unknown>) {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      scope,
      event,
      ...meta,
    })
  );
}
