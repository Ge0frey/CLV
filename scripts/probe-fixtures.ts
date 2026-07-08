/**
 * Discover which devnet fixtures actually have scores + odds data.
 * Reuses cached jwt/apiToken from .state.json (run proof-spike once first to populate).
 *   node --experimental-strip-types scripts/probe-fixtures.ts
 */
import fs from "node:fs";
import path from "node:path";
import axios from "axios";

const API = "https://txline-dev.txodds.com";
const STATE_PATH = path.join(import.meta.dirname, ".state.json");
const state = JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
const H = { Authorization: `Bearer ${state.jwt}`, "X-Api-Token": state.apiToken };
const get = (url: string, params?: object) => axios.get(`${API}${url}`, { params, headers: H, timeout: 30000 });
const log = (...a: unknown[]) => console.log(...a);

async function probeOne(f: any) {
  const id = f.FixtureId ?? f.fixtureId ?? f.Fixture_Id;
  let scores = "—", odds = "—", lastSeq = "", gs = "";
  try {
    const s = (await get(`/api/scores/snapshot/${id}`)).data;
    const arr = Array.isArray(s) ? s : [s];
    scores = `${arr.length} entries`;
    const withSeq = arr.filter((e) => e && e.seq != null).sort((a, b) => Number(b.seq) - Number(a.seq));
    if (withSeq[0]) { lastSeq = withSeq[0].seq; gs = withSeq[0].gameState; }
  } catch (e: any) { scores = `ERR ${e?.response?.status}`; }
  try {
    const o = (await get(`/api/odds/snapshot/${id}`)).data;
    odds = `${Array.isArray(o) ? o.length : 0} offers`;
  } catch (e: any) { odds = `ERR ${e?.response?.status}`; }
  return { id, scores, odds, lastSeq, gs };
}

async function main() {
  const fixtures = (await get(`/api/fixtures/snapshot`)).data;
  log("total fixtures:", Array.isArray(fixtures) ? fixtures.length : typeof fixtures);
  if (!Array.isArray(fixtures) || !fixtures.length) { log("raw:", JSON.stringify(fixtures).slice(0, 500)); return; }
  log("fixture[0] keys:", Object.keys(fixtures[0]));
  log("fixture[0]:", JSON.stringify(fixtures[0]));

  const now = Date.now();
  const norm = fixtures.map((f) => ({
    f, id: f.FixtureId, start: Number(f.StartTime ?? f.Start_Time ?? 0),
    p1: f.Participant1, p2: f.Participant2, comp: f.Competition ?? f.CompetitionId,
  }));
  // finished = start in the past; within 2 weeks preferred for historical
  const finished = norm.filter((x) => x.start && x.start < now).sort((a, b) => b.start - a.start);
  log(`\nfinished (past start): ${finished.length}`);
  finished.slice(0, 20).forEach((x) =>
    log(`  ${x.id}  ${new Date(x.start).toISOString().slice(0, 16)}  ${x.p1} vs ${x.p2}  [${x.comp}]`));

  log(`\nprobing scores+odds for up to 12 most-recent finished…`);
  const results: any[] = [];
  for (const x of finished.slice(0, 12)) {
    const r = await probeOne(x.f);
    log(`  ${r.id}  scores=${r.scores}  odds=${r.odds}  lastSeq=${r.lastSeq} gs=${r.gs}  (${x.p1} v ${x.p2})`);
    results.push({ ...r, p1: x.p1, p2: x.p2, start: x.start });
  }
  const good = results.filter((r) => /entries/.test(r.scores) && /offers/.test(r.odds) && Number(r.lastSeq) > 0);
  log(`\n✅ candidates with BOTH scores+odds: ${good.length}`);
  good.forEach((r) => log(`   FIXTURE=${r.id}  ${r.p1} v ${r.p2}  seq=${r.lastSeq} gs=${r.gs}`));
  if (good[0]) log(`\n>>> use FIXTURE=${good[0].id} for the spike`);
}
main().catch((e) => { console.error("probe failed:", e?.response?.status, e?.response?.data ?? e?.message); process.exit(1); });
