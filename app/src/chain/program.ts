import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey, ComputeBudgetProgram } from "@solana/web3.js";
import { Buffer } from "buffer";
import { CFG } from "../config";
import clvIdl from "./idl/clv.json";
import txoracleIdl from "./idl/txoracle.json";

export const TXORACLE = new PublicKey(CFG.txoracle);
export const connection = new Connection(CFG.rpc, "confirmed");

export function getProvider(wallet: any): AnchorProvider {
  return new AnchorProvider(connection, wallet, { commitment: "confirmed" });
}
export function clvProgram(provider: AnchorProvider): Program {
  return new Program(clvIdl as any, provider);
}
export function txoracleProgram(provider: AnchorProvider): Program {
  return new Program(txoracleIdl as any, provider);
}

export const cuIx = () => ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 });

const u16le = (n: number) => { const b = Buffer.alloc(2); b.writeUInt16LE(n); return b; };
const u64le = (bn: any) => (bn.toArrayLike ? bn.toArrayLike(Buffer, "le", 8) : Buffer.alloc(8));
export const epochDay = (tsMs: number) => Math.floor(tsMs / 86_400_000);

export const dailyOddsPda = (tsMs: number) =>
  PublicKey.findProgramAddressSync([Buffer.from("daily_batch_roots"), u16le(epochDay(tsMs))], TXORACLE)[0];
export const dailyScoresPda = (tsMs: number) =>
  PublicKey.findProgramAddressSync([Buffer.from("daily_scores_roots"), u16le(epochDay(tsMs))], TXORACLE)[0];
export const configPda = (programId: PublicKey) =>
  PublicKey.findProgramAddressSync([Buffer.from("config")], programId)[0];
export const predictionPda = (programId: PublicKey, predictor: PublicKey, id: any) =>
  PublicKey.findProgramAddressSync([Buffer.from("prediction"), predictor.toBuffer(), u64le(id)], programId)[0];
