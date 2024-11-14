import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaErrors } from "../target/types/solana_errors";
import { Keypair, PublicKey, LAMPORTS_PER_SOL, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';

describe("solana-errors", () => {

  anchor.setProvider(anchor.AnchorProvider.env());
  let connection = anchor.getProvider().connection;

  const program = anchor.workspace.SolanaErrors as Program<SolanaErrors>;
  const user1 = Keypair.generate();
  const data1 = Keypair.generate();
  const user2 = Keypair.generate();
  const data2 = Keypair.generate();

  before("prepare", async () => {
    await airdrop(anchor.getProvider().connection, user1.publicKey)
  })
 
  before("prepare", async () => {
    await airdrop(anchor.getProvider().connection, user2.publicKey)
  })
  
  it("Is initialized!", async () => {

    console.log("user1 balance = " + await connection.getBalance(user1.publicKey))
    console.log("user2 balance = " + await connection.getBalance(user2.publicKey))

    const tx1 = await program.methods
      .initialize()
      .accountsStrict({
        user: user1.publicKey,
        data: data1.publicKey,
        systemProgram: SystemProgram.programId
      })
      .signers([user1, data1])
      .rpc({skipPreflight: true});

    console.log("Your transaction signature, tx1: ", tx1);

    const tx2 = await program.methods
    .initialize()
    .accountsStrict({
      user: user2.publicKey,
      data: data2.publicKey,
      systemProgram: SystemProgram.programId
    })
    .signers([user2, data2])
    .rpc({skipPreflight: true});

  console.log("Your transaction signature, tx2: ", tx2);

  });
});


async function airdrop(connection: any, address: any, amount = 1000000000) {
  await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}
