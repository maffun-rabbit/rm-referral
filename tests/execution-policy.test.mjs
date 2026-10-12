import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {validateExecutionPolicy, validateIncidentRecord, validateStepGraph, validateRepository}
  from '../scripts/validate-execution-policy.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const policy = JSON.parse(read('config/operations-policy.json'));
const documents = {current: read('docs/operations/CURRENT.md'),
  execution: read('docs/operations/EXECUTION_POLICY.md'), agents: read('AGENTS.md')};
const clone = value => structuredClone(value);

test('repository entry, policy version, reference, limits and DESIGN_ONLY agree', () => {
  assert.equal(validateRepository(root).valid, true);
});
for (const key of ['initialDiagnosisMinutes', 'alternativeRoutesMinutes', 'redesignMinutes',
  'incidentTotalMinutes', 'additionalDifferentCauseAttempts', 'alternativeRouteKinds', 'maxBlockingCallSeconds']) {
  test(`reject relaxed threshold ${key}`, () => {
    const changed = clone(policy); changed.executionPolicy[key]++;
    assert.throws(() => validateExecutionPolicy(changed, documents), /invalid rule/);
  });
}
test('reject changed policy version, missing field and unsafe reference', () => {
  for (const mutate of [p => {p.executionPolicyVersion = '2.0.0';},
    p => {delete p.executionPolicy.sameConditionRetryAllowed;},
    p => {p.documents.execution = '../outside.md';}]) {
    const changed = clone(policy); mutate(changed);
    assert.throws(() => validateExecutionPolicy(changed, documents));
  }
});
test('reject inconsistent document version/limit and broken CURRENT/AGENTS entries', () => {
  for (const [key, before, after] of [
    ['execution', 'executionPolicyVersion: `1.0.0`', 'executionPolicyVersion: `2.0.0`'],
    ['execution', '| incidentTotalMinutes | 障害1件の合計 | 11分 |', '| incidentTotalMinutes | 障害1件の合計 | 12分 |'],
    ['current', '[EXECUTION_POLICY.md](EXECUTION_POLICY.md)', '[EXECUTION_POLICY.md](missing.md)'],
    ['agents', 'CURRENT.md経由のEXECUTION_POLICY.md', '旧方式を使用する'],
  ]) {
    const changed = clone(documents); assert.ok(changed[key].includes(before));
    changed[key] = changed[key].replace(before, after);
    assert.throws(() => validateExecutionPolicy(policy, changed));
  }
});
test('reject publication activation, automatic connection and retry/budget reset bypass', () => {
  const mutations = [p => {p.genesisCertified = true;}, p => {p.productionPublishEnabled = true;},
    p => {p.releaseScriptsConnected = true;}, p => {p.executionPolicy.automaticToolInterruptionConnected = true;}];
  for (const key of ['sameConditionRetryAllowed', 'budgetResetOnResumeAllowed',
    'unusedPhaseBudgetTransferAllowed', 'externalExplorationDuringRedesignAllowed',
    'unauthorizedAlternativeRoutesAllowed']) mutations.push(p => {p.executionPolicy[key] = true;});
  mutations.push(p => {p.executionPolicy.continueIndependentSteps = false;});
  for (const mutate of mutations) {
    const changed = clone(policy); mutate(changed);
    assert.throws(() => validateExecutionPolicy(changed, documents));
  }
});

function incident() {
  return {id: 'auth-incident-fixture', initialConditionId: 'original-credentials',
    initialDiagnosisSeconds: 180, alternativeRoutesSeconds: 300, redesignSeconds: 180, totalSeconds: 660,
    definitiveAuthFailure: false,
    additionalAttempts: [{conditionId: 'correct-account', changedCause: 'wrong account corrected', evidenceReference: 'mock-confirmed-account'},
      {conditionId: 'correct-permission', changedCause: 'permission independently confirmed', evidenceReference: 'mock-confirmed-permission'}],
    alternativeRoutes: [{kind: 'official-api', authorized: true, evidenceScope: 'version metadata only'},
      {kind: 'existing-dashboard', authorized: true, evidenceScope: 'UI display only'}]};
}
test('accept exact 3/5/3 and 11 minute boundaries as metadata, not proof of authorization', () => {
  assert.deepEqual(validateIncidentRecord(incident(), policy), {valid: true, actualAuthorizationAndTimingVerified: false});
});
test('incident validation cannot bypass the fixed policy contract', () => {
  const changed = clone(policy); changed.executionPolicy.incidentTotalMinutes = 60;
  assert.throws(() => validateIncidentRecord(incident(), changed), /invalid rule/);
  const missing = incident(); delete missing.definitiveAuthFailure;
  assert.throws(() => validateIncidentRecord(missing, policy), /diagnosis flag/);
});
for (const field of ['initialDiagnosisSeconds', 'alternativeRoutesSeconds', 'redesignSeconds', 'totalSeconds']) {
  test(`reject one second beyond ${field}`, () => {
    const changed = incident(); changed[field]++;
    assert.throws(() => validateIncidentRecord(changed, policy));
  });
}
test('unused phase time cannot extend alternatives, nor hide total elapsed time', () => {
  const changed = incident(); changed.initialDiagnosisSeconds = 0; changed.alternativeRoutesSeconds = 301;
  assert.throws(() => validateIncidentRecord(changed, policy), /phase budget/);
  changed.alternativeRoutesSeconds = 300; changed.totalSeconds = 1;
  assert.throws(() => validateIncidentRecord(changed, policy), /undercounted/);
});
test('reject repeated conditions, third additional attempt and missing changed-cause evidence', () => {
  for (const mutate of [x => {x.additionalAttempts[0].conditionId = x.initialConditionId;},
    x => {x.additionalAttempts.push(clone(x.additionalAttempts[0]));},
    x => {x.additionalAttempts[1].conditionId = x.additionalAttempts[0].conditionId;},
    x => {x.additionalAttempts[0].evidenceReference = ''; }]) {
    const changed = incident(); mutate(changed);
    assert.throws(() => validateIncidentRecord(changed, policy));
  }
});
test('definitive expiry/denial ends diagnosis without consuming remaining retries', () => {
  const changed = incident(); changed.definitiveAuthFailure = true;
  assert.throws(() => validateIncidentRecord(changed, policy), /end diagnosis/);
  changed.additionalAttempts = []; changed.initialDiagnosisSeconds = 2; changed.totalSeconds = 482;
  assert.equal(validateIncidentRecord(changed, policy).valid, true);
});
test('reject third alternative kind and unauthorized/evidence-free alternatives', () => {
  for (const mutate of [x => {x.alternativeRoutes.push({kind:'third', authorized:true, evidenceScope:'mock'});},
    x => {x.alternativeRoutes[0].authorized = false;}, x => {x.alternativeRoutes[0].evidenceScope = ''; }]) {
    const changed = incident(); mutate(changed);
    assert.throws(() => validateIncidentRecord(changed, policy));
  }
});

function steps() {
  return [{id:'review', state:'COMPLETED', dependencies:[], normalTimeBudgetSeconds:120},
    {id:'genesis', state:'BLOCKED', dependencies:[], normalTimeBudgetSeconds:300,
      blocked:{reason:'API 401/403', resolutionCondition:'independently verified authorized read succeeds',
        decisionDeadline:'2026-10-13T18:00:00+09:00', owner:'user/auth; Codex/evidence check', alternative:'report existing partial evidence'}},
    {id:'independent-report', state:'NOT_STARTED', dependencies:['review'], normalTimeBudgetSeconds:120},
    {id:'recognition', state:'NOT_STARTED', dependencies:['genesis'], normalTimeBudgetSeconds:120}];
}
test('continue independent ready work while Genesis and its consumer remain blocked', () => {
  assert.deepEqual(validateStepGraph(steps()).readyStepIds, ['independent-report']);
});
test('each BLOCKED field and absolute timezone-bearing deadline is mandatory', () => {
  for (const key of ['reason','resolutionCondition','decisionDeadline','owner','alternative']) {
    const changed = steps(); delete changed[1].blocked[key];
    assert.throws(() => validateStepGraph(changed));
  }
  for (const deadline of ['later', '2026-10-13', '2026-10-13T18:00:00',
    '2026-02-31T18:00:00+09:00', '2026-10-13T24:00:00+09:00', '2026-10-13T18:00:00+14:30']) {
    const changed = steps(); changed[1].blocked.decisionDeadline = deadline;
    assert.throws(() => validateStepGraph(changed), /absolute timestamp/);
  }
});
test('the 11 minute incident cap does not cap healthy normal steps', () => {
  const changed = steps(); changed[2].normalTimeBudgetSeconds = 3600;
  assert.deepEqual(validateStepGraph(changed).readyStepIds, ['independent-report']);
});
test('reject start/completion with a blocked prerequisite, unknown dependency and cycles', () => {
  for (const state of ['IN_PROGRESS', 'COMPLETED']) {
    const changed = steps(); changed[3].state = state;
    assert.throws(() => validateStepGraph(changed), /unmet dependency/);
  }
  const missing = steps(); missing[2].dependencies = ['missing'];
  assert.throws(() => validateStepGraph(missing), /unknown dependency/);
  const cycle = steps(); cycle[0].dependencies = ['independent-report'];
  assert.throws(() => validateStepGraph(cycle), /cycle/);
});
test('reject missing normal-time budget, invalid state and duplicate step IDs', () => {
  for (const mutate of [x => {delete x[0].normalTimeBudgetSeconds;},
    x => {x[0].normalTimeBudgetSeconds = 0;}, x => {x[0].state = 'SUCCESS';},
    x => {x[1].id = x[0].id;}]) {
    const changed = steps(); mutate(changed); assert.throws(() => validateStepGraph(changed));
  }
});
