import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const VERSION = '1.0.0';
const DOCUMENT = 'docs/operations/EXECUTION_POLICY.md';
const STATES = ['COMPLETED', 'IN_PROGRESS', 'BLOCKED', 'NOT_STARTED'];
const BLOCKED_FIELDS = ['reason', 'resolutionCondition', 'decisionDeadline', 'owner', 'alternative'];
const RULES = {
  authHttpStatuses: [401, 403],
  initialDiagnosisMinutes: 3, additionalDifferentCauseAttempts: 2,
  alternativeRouteKinds: 2, alternativeRoutesMinutes: 5, redesignMinutes: 3,
  incidentTotalMinutes: 11, maxBlockingCallSeconds: 60,
  sameConditionRetryAllowed: false, differentCauseEvidenceRequired: true,
  definitiveAuthFailureEndsDiagnosis: true, unauthorizedAlternativeRoutesAllowed: false,
  evidenceScopeMustMatchMethod: true, wallClockIncludesToolWait: true,
  sharedBudgetAcrossStepsAndTools: true, budgetResetOnResumeAllowed: false,
  unusedPhaseBudgetTransferAllowed: false, externalExplorationDuringRedesignAllowed: false,
  normalStepTimeBudgetRequired: true, continueIndependentSteps: true,
  stepStates: STATES, blockedRequiredFields: BLOCKED_FIELDS,
  validationImplemented: true, automaticToolInterruptionConnected: false,
  releaseProgramsConnected: false,
};
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
function check(condition, message) { if (!condition) throw new Error(message); }
function validateRuleContract(policy) {
  check(policy.executionPolicyVersion === VERSION, 'execution policy version mismatch');
  const rules = policy.executionPolicy;
  check(rules && typeof rules === 'object' && !Array.isArray(rules), 'missing execution policy');
  check(Object.keys(rules).sort().join() === Object.keys(RULES).sort().join(), 'unknown/missing execution rule');
  for (const [key, expected] of Object.entries(RULES)) {
    check(JSON.stringify(rules[key]) === JSON.stringify(expected), `invalid rule: ${key}`);
  }
  return rules;
}
function absoluteDeadline(value) {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(Z|[+-](\d{2}):(\d{2}))$/);
  if (!m) return false;
  const [year, month, day, hour, minute, second] = m.slice(1, 7).map(Number);
  const leap = year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const zoneHour = Number(m[8] || 0), zoneMinute = Number(m[9] || 0);
  return month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1] &&
    hour < 24 && minute < 60 && second < 60 && zoneHour <= 14 && zoneMinute < 60 &&
    (zoneHour < 14 || zoneMinute === 0) && Number.isFinite(Date.parse(value));
}

export function validateExecutionPolicy(policy, documents) {
  check(policy.executionPolicyVersion === VERSION, 'execution policy version mismatch');
  check(policy.documents?.execution === DOCUMENT, 'execution document reference mismatch');
  check(policy.operationsState === 'DESIGN_ONLY' && policy.genesisCertified === false &&
    policy.genesisId === null && policy.productionPublishEnabled === false,
  'recognition/publication state must remain DESIGN_ONLY');
  check(policy.releaseScriptsConnected === false, 'release scripts must remain disconnected');
  const rules = validateRuleContract(policy);
  check(rules.initialDiagnosisMinutes + rules.alternativeRoutesMinutes + rules.redesignMinutes ===
    rules.incidentTotalMinutes, 'phase/total budget inconsistency');
  for (const text of [documents.current, documents.execution]) {
    check(typeof text === 'string' && text.includes(`executionPolicyVersion: \`${VERSION}\``),
      'document version mismatch');
  }
  check(documents.current.includes('[EXECUTION_POLICY.md](EXECUTION_POLICY.md)'), 'CURRENT execution link missing');
  check(documents.execution.includes('[CURRENT.md](CURRENT.md)') &&
    documents.execution.includes('[operations-policy.json](../../config/operations-policy.json)'),
  'execution entry/policy link missing');
  check(documents.agents.includes('docs/operations/CURRENT.md') &&
    documents.agents.includes('CURRENT.md経由のEXECUTION_POLICY.md'), 'AGENTS entry missing');
  const limits = {
    initialDiagnosisMinutes: '3分', additionalDifferentCauseAttempts: '2回',
    alternativeRouteKinds: '2種類', alternativeRoutesMinutes: '5分',
    redesignMinutes: '3分', incidentTotalMinutes: '11分', maxBlockingCallSeconds: '60秒',
  };
  for (const [key, expected] of Object.entries(limits)) {
    const row = documents.execution.split('\n').filter(line => line.startsWith(`| ${key} |`));
    check(row.length === 1 && row[0].split('|')[3].trim() === expected, `document limit mismatch: ${key}`);
  }
  return {executionPolicyVersion: VERSION, valid: true, scope: 'offline validation only; no tool or release enforcement'};
}

// These functions validate recorded metadata/fixtures; they do not prove actual
// authorization, elapsed time, or cause evidence and never contact an API.
export function validateIncidentRecord(incident, policy) {
  const rules = validateRuleContract(policy);
  check(nonempty(incident.id) && nonempty(incident.initialConditionId), 'incident identity missing');
  check(typeof incident.definitiveAuthFailure === 'boolean', 'auth diagnosis flag missing/invalid');
  const phases = {initialDiagnosisSeconds: 'initialDiagnosisMinutes',
    alternativeRoutesSeconds: 'alternativeRoutesMinutes', redesignSeconds: 'redesignMinutes'};
  let sum = 0;
  for (const [field, limit] of Object.entries(phases)) {
    const seconds = incident[field];
    check(Number.isFinite(seconds) && seconds >= 0 && seconds <= rules[limit] * 60, `phase budget exceeded/invalid: ${field}`);
    sum += seconds;
  }
  check(Number.isFinite(incident.totalSeconds) && incident.totalSeconds >= sum &&
    incident.totalSeconds <= rules.incidentTotalMinutes * 60, 'total budget exceeded/undercounted');
  check(Array.isArray(incident.additionalAttempts) &&
    incident.additionalAttempts.length <= rules.additionalDifferentCauseAttempts, 'additional attempt limit exceeded');
  check(!(incident.definitiveAuthFailure && incident.additionalAttempts.length), 'definitive auth failure must end diagnosis');
  const seen = new Set([incident.initialConditionId]);
  for (const attempt of incident.additionalAttempts) {
    check(nonempty(attempt.conditionId) && !seen.has(attempt.conditionId), 'same-condition retry');
    check(nonempty(attempt.changedCause) && nonempty(attempt.evidenceReference), 'changed-cause evidence missing');
    seen.add(attempt.conditionId);
  }
  check(Array.isArray(incident.alternativeRoutes) &&
    new Set(incident.alternativeRoutes.map(x => x.kind)).size <= rules.alternativeRouteKinds,
  'alternative route kind limit exceeded');
  for (const route of incident.alternativeRoutes) {
    check(nonempty(route.kind) && route.authorized === true && nonempty(route.evidenceScope),
      'unauthorized/unspecified alternative route');
  }
  return {valid: true, actualAuthorizationAndTimingVerified: false};
}

export function validateStepGraph(steps) {
  check(Array.isArray(steps) && steps.length > 0, 'steps missing');
  const byId = new Map();
  for (const step of steps) {
    check(nonempty(step.id) && !byId.has(step.id), 'invalid/duplicate step id');
    check(STATES.includes(step.state), 'invalid step state');
    check(Number.isSafeInteger(step.normalTimeBudgetSeconds) && step.normalTimeBudgetSeconds > 0,
      'normal step time budget missing/invalid');
    check(Array.isArray(step.dependencies) && new Set(step.dependencies).size === step.dependencies.length,
      'dependencies missing/duplicate');
    if (step.state === 'BLOCKED') {
      check(step.blocked && BLOCKED_FIELDS.every(field => nonempty(step.blocked[field])), 'incomplete BLOCKED record');
      const deadline = step.blocked.decisionDeadline;
      check(absoluteDeadline(deadline), 'BLOCKED deadline must be an absolute timestamp with valid calendar date and timezone');
    }
    byId.set(step.id, step);
  }
  const visiting = new Set(), visited = new Set();
  function visit(id) {
    check(byId.has(id), 'unknown dependency');
    check(!visiting.has(id), 'dependency cycle');
    if (visited.has(id)) return;
    visiting.add(id);
    const step = byId.get(id);
    for (const dep of step.dependencies) {
      visit(dep);
      if (step.state === 'IN_PROGRESS' || step.state === 'COMPLETED') {
        check(byId.get(dep).state === 'COMPLETED', 'started/completed step has unmet dependency');
      }
    }
    visiting.delete(id); visited.add(id);
  }
  for (const id of byId.keys()) visit(id);
  return {valid: true, readyStepIds: steps.filter(step => step.state === 'NOT_STARTED' &&
    step.dependencies.every(id => byId.get(id).state === 'COMPLETED')).map(step => step.id)};
}

export function validateRepository(root) {
  const read = name => readFileSync(resolve(root, name), 'utf8');
  const policy = JSON.parse(read('config/operations-policy.json'));
  // Validate the fixed reference before any path derived from configuration is used.
  check(policy.documents?.execution === DOCUMENT, 'execution document reference mismatch');
  return validateExecutionPolicy(policy, {
    current: read('docs/operations/CURRENT.md'), execution: read(DOCUMENT), agents: read('AGENTS.md'),
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  try { console.log(JSON.stringify(validateRepository(root))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
