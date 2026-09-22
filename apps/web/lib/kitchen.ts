import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

export const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

// Kitchen Treasury address (defaults to official incinerator/burn address for deflationary utensil purchases)
export const KITCHEN_TREASURY_PUBKEY = new PublicKey(
  process.env.NEXT_PUBLIC_TREASURY_ADDRESS ||
    "1nc1nerator11111111111111111111111111111111"
);

export const COOKIE_CHAIN_GENESIS_HASH =
  "9wDaBRDgArEUpvhHxGguNkwozsZh4UpGZB9o2EoEcBB2";
export const COOKIE_CHAIN_RPC = "https://rpc.cookiescan.io";

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

export async function createKitchenEquipTx(
  connection: Connection,
  walletPubKey: PublicKey,
  toolId: string,
  priceInCook: number
): Promise<Transaction> {
  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  const transaction = new Transaction({
    feePayer: walletPubKey,
    recentBlockhash: blockhash,
  });

  // If the utensil costs COOK (i.e. not the free starter wooden spoon),
  // transfer actual COOK (in lamports) to the kitchen treasury
  if (priceInCook > 0) {
    const lamports = Math.round(priceInCook * LAMPORTS_PER_SOL);
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: walletPubKey,
        toPubkey: KITCHEN_TREASURY_PUBKEY,
        lamports,
      })
    );
  }

  // Add the on-chain memo proof
  transaction.add(
    new TransactionInstruction({
      keys: [{ pubkey: walletPubKey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(`kitchen:v1:equip:${toolId}`, "utf-8"),
    })
  );

  return transaction;
}

export function parseKitchenMemo(raw: string | null | undefined): string | null {
  if (!raw) return null;
  // Match both "[<len>] kitchen:v1:..." and raw "kitchen:v1:..."
  const match = raw.match(/^(?:\[\d+\]\s*)?(kitchen:v1:[^\s]+)/);
  return match && match[1] ? match[1] : null;
}

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
