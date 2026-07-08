/**
 * Deep-probe one fixture's scores + odds shapes to wire the proofs.
 *   FIXTURE=18172379 node --experimental-strip-types scripts/probe-detail.ts
 */
import fs from "node:fs";
import path from "node:path";
import axios from "axios";

const API = "https://txline-dev.txodds.com";
const FIXTURE = Number(process.env.FIXTURE ?? 18172379); // USA v Bosnia
const state = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, ".state.json"), "utf8"));
const H = { Authorization: `Bearer ${state.jwt}`, "X-Api-Token": state.apiToken };
const get = (url: string, params?: object) => axios.get(`${API}${url}`, { params, headers: H, timeout: 30000 });
const log = (...a: unknown[]) => console.log(...a);
const hr = (t: string) => log(`\n──────── ${t} ────────`);
const tryGet = async (label: string, url: string, params?: object) => {
  try { const r = await get(url, params); return r.data; }
  catch (e: any) { log(`  ${label}: ERR ${e?.response?.status} ${JSON.stringify(e?.response?.data)?.slice(0,120)}`); return null; }
};

async function main() {
  const fixtures = (await get(`/api/fixtures/snapshot`)).data;
  const fx = fixtures.find((f: any) => f.FixtureId === FIXTURE);
  log("fixture:", JSON.stringify(fx));
  const start = Number(fx.StartTime);

  hr("scores/snapshot");
  const snap = await tryGet("snapshot", `/api/scores/snapshot/${FIXTURE}`);
  if (Array.isArray(snap)) { log("entries:", snap.length); log("entry[0] keys:", Object.keys(snap[0]??{})); log("entry[0]:", JSON.stringify(snap[0])?.slice(0,500)); log("entry[last]:", JSON.stringify(snap[snap.length-1])?.slice(0,500)); }

  hr("scores/historical");
  const hist = await tryGet("historical", `/api/scores/historical/${FIXTURE}`);
  if (Array.isArray(hist)) {
    log("updates:", hist.length);
    log("update[0] keys:", Object.keys(hist[0]??{}));
    const last = hist[hist.length-1];
    log("update[last]:", JSON.stringify(last)?.slice(0,600));
    const seqs = hist.map((u:any)=>u.seq).filter((s:any)=>s!=null);
    log("seq range:", seqs[0], "→", seqs[seqs.length-1], " count:", seqs.length);
    const finals = hist.filter((u:any)=>Number(u.gameState)===5);
    log("gameState=5 (F) updates:", finals.length, finals.length?`lastFinalSeq=${finals[finals.length-1].seq}`:"");
    // show the stat map on the last update (to see stat key encoding present)
    log("last update full:", JSON.stringify(last));
  }

  hr("scores/updates/{fixtureId} (current 5-min)");
  const cur = await tryGet("updates", `/api/scores/updates/${FIXTURE}`);
  if (Array.isArray(cur)) log("current updates:", cur.length);

  hr("odds/snapshot (live)");
  const os = await tryGet("odds snap", `/api/odds/snapshot/${FIXTURE}`);
  log("odds snap:", Array.isArray(os)?os.length:os);

  hr("odds/snapshot?asOf=mid-match");
  for (const off of [ -3600000, 900000, 2700000, 5400000 ]) { // 1h before, 15m, 45m, 90m after start
    const asOf = start + off;
    const d = await tryGet(`asOf ${off/60000}m`, `/api/odds/snapshot/${FIXTURE}`, { asOf });
    if (Array.isArray(d) && d.length) { log(`  asOf ${off/60000}m -> ${d.length} offers; [0]:`, JSON.stringify(d[0])?.slice(0,400)); break; }
    else log(`  asOf ${off/60000}m -> ${Array.isArray(d)?d.length:d}`);
  }

  hr("odds/updates/{fixtureId} (current)");
  const ou = await tryGet("odds upd", `/api/odds/updates/${FIXTURE}`);
  log("odds updates(current):", Array.isArray(ou)?ou.length:ou);

  hr("odds/updates/{epochDay}/{hour}/{interval} around kickoff");
  const startMs = start;
  for (let h = -2; h <= 1; h++) {
    const t = new Date(startMs + h*3600000);
    const epochDay = Math.floor(t.getTime()/86400000);
    const hour = t.getUTCHours();
    for (const interval of [0,3,6,9]) {
      const d = await tryGet(`slot d${epochDay} h${hour} i${interval}`, `/api/odds/updates/${epochDay}/${hour}/${interval}`);
      if (Array.isArray(d) && d.length) {
        const mine = d.filter((o:any)=>Number(o.FixtureId)===FIXTURE);
        log(`  d${epochDay} h${hour} i${interval}: ${d.length} total, ${mine.length} for fixture`);
        if (mine.length) { log("    sample:", JSON.stringify(mine[0])?.slice(0,400)); return; }
      }
    }
  }
  log("no odds slot found for fixture around kickoff");
}
main().catch((e)=>{ console.error("failed:", e?.response?.status, e?.response?.data ?? e?.message); process.exit(1); });
