import { BN, Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { txline } from "../lib/txline";
import { oddsToProgram, oddsSummary, scoresSummary, statTerm, nodes } from "../lib/codec";
import { type MarketDef, predicateFor, finalResult } from "../lib/domain";
import { TXORACLE, cuIx, configPda, predictionPda, dailyOddsPda, dailyScoresPda } from "./program";

export async function ensureConfig(program: Program): Promise<PublicKey> {
  const cfg = configPda(program.programId);
  const info = await program.provider.connection.getAccountInfo(cfg);
  if (!info) {
    await program.methods.initializeConfig()
      .accounts({ admin: (program.provider as any).wallet.publicKey, config: cfg, systemProgram: SystemProgram.programId })
      .rpc();
  }
  return cfg;
}

/** open_prediction: CPI validate_odds proves the entry line, stores entry implied prob. */
export async function openPrediction(program: Program, fixtureId: number, market: MarketDef, entryRec: any) {
  const val = await txline.oddsValidation(entryRec.MessageId, entryRec.Ts);
  const predictor = (program.provider as any).wallet.publicKey as PublicKey;
  const cfg = await ensureConfig(program);
  const id = new BN(Date.now());
  const pred = predictionPda(program.programId, predictor, id);
  const sig = await program.methods
    .openPrediction(id, new BN(fixtureId), market.marketArg, market.selection, market.lineX10, market.priceIndex,
      new BN(val.odds.Ts), oddsToProgram(val.odds), oddsSummary(val.summary), nodes(val.subTreeProof), nodes(val.mainTreeProof))
    .accounts({ predictor, config: cfg, prediction: pred, dailyOddsMerkleRoots: dailyOddsPda(Number(val.odds.Ts)), txoracleProgram: TXORACLE, systemProgram: SystemProgram.programId })
    .preInstructions([cuIx()]).rpc();
  return { id: id.toString(), pred, sig };
}

/** settle_close: CPI validate_odds proves the closing line, records CLV. */
export async function settleClose(program: Program, pred: PublicKey, closeRec: any, priceIndex: number) {
  const val = await txline.oddsValidation(closeRec.MessageId, closeRec.Ts);
  return program.methods
    .settleClose(new BN(val.odds.Ts), priceIndex, oddsToProgram(val.odds), oddsSummary(val.summary), nodes(val.subTreeProof), nodes(val.mainTreeProof))
    .accounts({ settler: (program.provider as any).wallet.publicKey, prediction: pred, dailyOddsMerkleRoots: dailyOddsPda(Number(val.odds.Ts)), txoracleProgram: TXORACLE })
    .preInstructions([cuIx()]).rpc();
}

/** settle_outcome: CPI validate_stat proves the result using stored predicate. */
export async function settleOutcome(program: Program, pred: PublicKey, fixtureId: number) {
  const { val } = await finalResult(fixtureId);
  return program.methods
    .settleOutcome(new BN(val.summary.updateStats.minTimestamp), scoresSummary(val.summary), nodes(val.subTreeProof), nodes(val.mainTreeProof), statTerm(val, 1), statTerm(val, 2))
    .accounts({ settler: (program.provider as any).wallet.publicKey, prediction: pred, dailyScoresMerkleRoots: dailyScoresPda(Number(val.summary.updateStats.minTimestamp)), txoracleProgram: TXORACLE })
    .preInstructions([cuIx()]).rpc();
}

export async function listPredictions(program: Program) {
  const all = await (program.account as any).prediction.all();
  return all.map((a: any) => ({ pubkey: a.publicKey.toBase58(), ...a.account }));
}

// ---- read-only Verify badges (txoracle .view(), no wallet cost) ----
export async function verifyOdds(txProgram: Program, val: any): Promise<boolean> {
  return txProgram.methods
    .validateOdds(new BN(val.odds.Ts), oddsToProgram(val.odds), oddsSummary(val.summary), nodes(val.subTreeProof), nodes(val.mainTreeProof))
    .accounts({ dailyOddsMerkleRoots: dailyOddsPda(Number(val.odds.Ts)) }).preInstructions([cuIx()]).view();
}

export async function verifyStat(txProgram: Program, val: any, market: MarketDef): Promise<boolean> {
  const { comparison, op, threshold } = predicateFor(market);
  return txProgram.methods
    .validateStat(new BN(val.summary.updateStats.minTimestamp), scoresSummary(val.summary), nodes(val.subTreeProof), nodes(val.mainTreeProof),
      { threshold, comparison }, statTerm(val, 1), statTerm(val, 2), op)
    .accounts({ dailyScoresMerkleRoots: dailyScoresPda(Number(val.summary.updateStats.minTimestamp)) }).preInstructions([cuIx()]).view();
}
