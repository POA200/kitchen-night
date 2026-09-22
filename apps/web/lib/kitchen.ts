import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

export const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

export async function createKitchenMemoTx(
  connection: Connection,
  walletPubKey: PublicKey,
  memoString: string
): Promise<Transaction> {
  const instruction = new TransactionInstruction({
    keys: [{ pubkey: walletPubKey, isSigner: true, isWritable: false }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memoString, "utf-8"),
  });

  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  const transaction = new Transaction({
    feePayer: walletPubKey,
    recentBlockhash: blockhash,
  }).add(instruction);

  return transaction;
}

export const COOKIE_CHAIN_GENESIS_HASH =
  "9wDaBRDgArEUpvhHxGguNkwozsZh4UpGZB9o2EoEcBB2";
export const COOKIE_CHAIN_RPC = "https://rpc.cookiescan.io";

export async function promptNightlySwitchNetwork(): Promise<boolean> {
  if (
    typeof window !== "undefined" &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).nightly?.solana?.changeNetwork
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (window as any).nightly.solana.changeNetwork({
        genesisHash: COOKIE_CHAIN_GENESIS_HASH,
        url: COOKIE_CHAIN_RPC,
      });
      return true;
    } catch (e) {
      console.warn("User rejected or failed to switch network in Nightly:", e);
      return false;
    }
  }
  return false;
}

