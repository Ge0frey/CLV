/**
 * M1 devnet integration test — drive the full clv lifecycle against REAL txoracle roots:
 *   initialize_config -> open_prediction (CPI validate_odds, entry line)
 *   -> settle_close (CPI validate_odds, closing line) -> settle_outcome (CPI validate_stat)
 * then read the Prediction account and print the on-chain CLV + outcome.
 *
 *   node --experimental-strip-types scripts/settle-e2e.ts
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, ComputeBudgetProgram, SystemProgram } from "@solana/web3.js";
import axios from "axios";

const BN: any = (anchor as any).BN ?? (anchor as any).default?.BN;
const RPC_URL = process.env.RPC_URL ?? "https://devnet.helius-rpc.com/?api-key=e26a41e3-3e82-45eb-956f-5a2160c31324";
const API = "https://txline-dev.txodds.com";
const TXORACLE_PID = new PublicKey("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J");
const FIXTURE = Number(process.env.FIXTURE ?? 18172379); // USA 2-0 Bosnia
const WALLET_PATH = process.env.WALLET ?? path.join(os.homedir(), ".config/solana/txodds.json");
const STATE_PATH = path.join(import.meta.dirname, ".state.json");
const CLV_IDL = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "../target/idl/clv.json"), "utf8"));

const log = (...a: unknown[]) => console.log(...a);
const hr = (t: string) => log(`\n──────── ${t} ────────`);
const b64ToBytes = (s: string): number[] => { const b = Buffer.from(s, "base64"); if (b.length !== 32) throw new Error(`bad root len ${b.length}`); return [...b]; };
const nodes = (l: any) => Array.isArray(l) ? l.map((n) => ({ hash: b64ToBytes(n.hash), isRightSibling: !!n.isRightSibling })) : [];
const epochDayPda = (seed: string, tsMs: number) => { const d = Math.floor(tsMs / 86_400_000); const b = Buffer.alloc(2); b.writeUInt16LE(d); return PublicKey.findProgramAddressSync([Buffer.from(seed), b], TXORACLE_PID)[0]; };

const secret = JSON.parse(fs.readFileSync(WALLET_PATH, "utf8"));
const keypair = Keypair.fromSecretKey(Uint8Array.from(secret));
const connection = new Connection(RPC_URL, "confirmed");
const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(keypair), { commitment: "confirmed" });
anchor.setProvider(provider);
const program = new anchor.Program(CLV_IDL, provider);
const state = JSON.parse(fs.readFileSync(STATE_PATH, "utf8"));
const authGet = (url: string, params?: object) => axios.get(`${API}${url}`, { params, timeout: 30000, headers: { Authorization: `Bearer ${state.jwt}`, "X-Api-Token": state.apiToken } });

const oddsToProgram = (o: any) => ({
  fixtureId: new BN(o.FixtureId), messageId: o.MessageId, ts: new BN(o.Ts), bookmaker: o.Bookmaker,
  bookmakerId: o.BookmakerId, superOddsType: o.SuperOddsType, gameState: o.GameState ?? null, inRunning: !!o.InRunning,
  marketParameters: o.MarketParameters ?? null, marketPeriod: o.MarketPeriod ?? null, priceNames: o.PriceNames ?? [], prices: o.Prices ?? [],
});
const oddsSummary = (s: any) => ({ fixtureId: new BN(s.fixtureId), updateStats: { updateCount: s.updateStats.updateCount, minTimestamp: new BN(s.updateStats.minTimestamp), maxTimestamp: new BN(s.updateStats.maxTimestamp) }, oddsSubTreeRoot: b64ToBytes(s.oddsSubTreeRoot) });
const scoresSummary = (s: any) => ({ fixtureId: new BN(s.fixtureId), updateStats: { updateCount: s.updateStats.updateCount, minTimestamp: new BN(s.updateStats.minTimestamp), maxTimestamp: new BN(s.updateStats.maxTimestamp) }, eventsSubTreeRoot: b64ToBytes(s.eventStatsSubTreeRoot) });

const cuIx = () => ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 });
const configPda = () => PublicKey.findProgramAddressSync([Buffer.from("config")], program.programId)[0];
const predictionPda = (id: any) => PublicKey.findProgramAddressSync([Buffer.from("prediction"), keypair.publicKey.toBuffer(), new BN(id).toArrayLike(Buffer, "le", 8)], program.programId)[0];

async function pickOdds(start: number, offMs: number): Promise<any | null> {
  const d = (await authGet(`/api/odds/snapshot/${FIXTURE}`, { asOf: start + offMs })).data;
  if (!Array.isArray(d)) return null;
  // full-match 1X2 = SuperOddsType 1X2_PARTICIPANT_RESULT with MarketPeriod null
  return d.find((o) => /1X2/i.test(o.SuperOddsType) && (o.MarketPeriod == null) && Array.isArray(o.Prices) && o.Prices.length >= 3) ?? null;
}

async function main() {
  log("wallet:", keypair.publicKey.toBase58(), "clv:", program.programId.toBase58(), "fixture:", FIXTURE);

  hr("initialize_config (idempotent)");
  const cfg = configPda();
  const existing = await connection.getAccountInfo(cfg);
  if (!existing) {
    const sig = await program.methods.initializeConfig().accounts({ admin: keypair.publicKey, config: cfg, systemProgram: SystemProgram.programId }).rpc();
    log("initialized config:", sig);
  } else log("config already initialized");

  const fx = (await authGet(`/api/fixtures/snapshot`)).data.find((f: any) => f.FixtureId === FIXTURE);
  const start = Number(fx.StartTime);
  log(`fixture: ${fx.Participant1} vs ${fx.Participant2}  start=${new Date(start).toISOString()}`);

  const id = new BN(Date.now());
  const pred = predictionPda(id);
  log("prediction PDA:", pred.toBase58(), "id:", id.toString());

  // ENTRY: earliest pre-kickoff full-match 1X2 (Home = part1 = index 0)
  hr("open_prediction  (CPI validate_odds — entry line)");
  const entryRec = await pickOdds(start, -3_600_000) ?? await pickOdds(start, -1_800_000);
  if (!entryRec) throw new Error("no entry 1X2 odds");
  const entryVal = (await authGet(`/api/odds/validation`, { messageId: entryRec.MessageId, ts: entryRec.Ts })).data;
  log(`entry line: prices=${entryVal.odds.Prices} (home ${entryVal.odds.Prices[0]}=${(entryVal.odds.Prices[0]/1000).toFixed(3)})  ts=${entryVal.odds.Ts}`);
  const oddsRootEntry = epochDayPda("daily_batch_roots", Number(entryVal.odds.Ts));
  await program.methods.openPrediction(
      id, new BN(FIXTURE), { result1X2: {} }, 0, 0, 0, new BN(entryVal.odds.Ts),
      oddsToProgram(entryVal.odds), oddsSummary(entryVal.summary), nodes(entryVal.subTreeProof), nodes(entryVal.mainTreeProof),
    ).accounts({ predictor: keypair.publicKey, config: cfg, prediction: pred, dailyOddsMerkleRoots: oddsRootEntry, txoracleProgram: TXORACLE_PID, systemProgram: SystemProgram.programId })
    .preInstructions([cuIx()]).rpc();
  let p = await program.account.prediction.fetch(pred);
  log(`  -> entry_prob_bps = ${p.entryProbBps} (${(p.entryProbBps/100).toFixed(2)}%)  status=${JSON.stringify(p.status)}`);

  // CLOSE: latest pre-kickoff full-match 1X2 (different Ts)
  hr("settle_close  (CPI validate_odds — closing line)");
  let closeRec = await pickOdds(start, -60_000) ?? await pickOdds(start, -300_000) ?? await pickOdds(start, -600_000);
  if (closeRec && closeRec.Ts === entryRec.Ts) closeRec = await pickOdds(start, -900_000);
  if (!closeRec) throw new Error("no closing 1X2 odds");
  const closeVal = (await authGet(`/api/odds/validation`, { messageId: closeRec.MessageId, ts: closeRec.Ts })).data;
  log(`close line: prices=${closeVal.odds.Prices} (home ${closeVal.odds.Prices[0]}=${(closeVal.odds.Prices[0]/1000).toFixed(3)})  ts=${closeVal.odds.Ts}`);
  const oddsRootClose = epochDayPda("daily_batch_roots", Number(closeVal.odds.Ts));
  await program.methods.settleClose(
      new BN(closeVal.odds.Ts), 0, oddsToProgram(closeVal.odds), oddsSummary(closeVal.summary), nodes(closeVal.subTreeProof), nodes(closeVal.mainTreeProof),
    ).accounts({ settler: keypair.publicKey, prediction: pred, dailyOddsMerkleRoots: oddsRootClose, txoracleProgram: TXORACLE_PID })
    .preInstructions([cuIx()]).rpc();
  p = await program.account.prediction.fetch(pred);
  log(`  -> close_prob_bps = ${p.closeProbBps} (${(p.closeProbBps/100).toFixed(2)}%)   CLV = ${p.clvBps} bps`);

  // OUTCOME: final goals via validate_stat (Home: P1 - P2 > 0)
  hr("settle_outcome  (CPI validate_stat — result)");
  const snap = (await authGet(`/api/scores/snapshot/${FIXTURE}`)).data.filter((e: any) => e.Seq != null).sort((a: any, b: any) => Number(b.Seq) - Number(a.Seq));
  let statVal: any = null, seq = 0;
  for (const e of snap.slice(0, 12)) { try { statVal = (await authGet(`/api/scores/stat-validation`, { fixtureId: FIXTURE, seq: e.Seq, statKey: 1, statKey2: 2 })).data; seq = e.Seq; break; } catch {} }
  if (!statVal) throw new Error("no stat-validation");
  log(`result: P1(USA)=${statVal.statToProve.value} P2(BIH)=${statVal.statToProve2.value}  seq=${seq}`);
  const scoresRoot = epochDayPda("daily_scores_roots", Number(statVal.summary.updateStats.minTimestamp));
  const statA = { statToProve: statVal.statToProve, eventStatRoot: b64ToBytes(statVal.eventStatRoot), statProof: nodes(statVal.statProof) };
  const statB = { statToProve: statVal.statToProve2, eventStatRoot: b64ToBytes(statVal.eventStatRoot), statProof: nodes(statVal.statProof2) };
  await program.methods.settleOutcome(
      new BN(statVal.summary.updateStats.minTimestamp), scoresSummary(statVal.summary), nodes(statVal.subTreeProof), nodes(statVal.mainTreeProof), statA, statB,
    ).accounts({ settler: keypair.publicKey, prediction: pred, dailyScoresMerkleRoots: scoresRoot, txoracleProgram: TXORACLE_PID })
    .preInstructions([cuIx()]).rpc();

  p = await program.account.prediction.fetch(pred);
  hr("ON-CHAIN PREDICTION (final)");
  log(JSON.stringify({
    fixture: FIXTURE, market: "Result 1X2 / Home", entry_prob_bps: Number(p.entryProbBps), close_prob_bps: Number(p.closeProbBps),
    clv_bps: Number(p.clvBps), outcome_win: p.outcomeWin, status: p.status,
  }, null, 2));
  log(`\n✅ M1 GREEN — full custom settlement engine verified on devnet.`);
  log(`   Home ${p.outcomeWin ? "WON" : "did not win"}; CLV ${Number(p.clvBps) >= 0 ? "+" : ""}${(Number(p.clvBps)/100).toFixed(2)}% (close - entry implied prob).`);
}
main().catch((e) => { console.error("\n❌ FAILED:", e?.message ?? e); if (e?.getLogs) e.getLogs().then?.((l: any) => console.error(l)); if (e?.logs) console.error(e.logs.join("\n")); process.exit(1); });
