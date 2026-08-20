import { writeJson } from "./files.mjs";

function asIsoTimestamp(value) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" && Number.isFinite(Date.parse(value))) return new Date(value).toISOString();
  throw new Error(`Expected an ISO timestamp, received ${JSON.stringify(value)}.`);
}

function requiredString(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
  return value;
}

export function createActionLogger({ now = () => new Date(), monotonicNow = () => performance.now() } = {}) {
  const actions = [];
  const actionIds = new Set();
  let startedAt = null;
  let previousMonotonic = 0;

  function record({ id, type, target, ...optional }) {
    requiredString(id, "Action id");
    requiredString(type, "Action type");
    requiredString(target, "Action target");
    if (actionIds.has(id)) throw new Error(`Duplicate action id: ${id}.`);

    const sampledMonotonic = Number(monotonicNow());
    const effectiveMonotonic = Number.isFinite(sampledMonotonic)
      ? Math.max(previousMonotonic, sampledMonotonic)
      : previousMonotonic;
    if (startedAt === null) startedAt = effectiveMonotonic;
    previousMonotonic = effectiveMonotonic;

    // Sequence and timestamps are capture evidence, not caller-controlled labels.
    // Strip them before retaining useful optional metadata such as an assertion text.
    delete optional.sequence;
    delete optional.at;
    delete optional.elapsedMs;

    const action = {
      id,
      sequence: actions.length + 1,
      type,
      target,
      at: asIsoTimestamp(now()),
      elapsedMs: Math.max(0, Math.round(effectiveMonotonic - startedAt)),
      ...optional,
    };
    actionIds.add(id);
    actions.push(action);
    return { ...action };
  }

  function toJSON() {
    return {
      schemaVersion: 1,
      actions: actions.map((action) => ({ ...action })),
    };
  }

  return { record, toJSON };
}

export async function writeActionLog(filePath, logger) {
  if (!logger || typeof logger.toJSON !== "function") {
    throw new Error("writeActionLog expects an action logger.");
  }
  await writeJson(filePath, logger.toJSON());
}
