import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaErrors } from "../target/types/solana_errors";
import { Keypair, PublicKey, LAMPORTS_PER_SOL, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';
import { assert } from "chai";

describe("solana-errors", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  let connection = anchor.getProvider().connection;

  const program = anchor.workspace.SolanaErrors as Program<SolanaErrors>;
  const user = Keypair.generate();
  // const data = Keypair.generate();
  const [data] = PublicKey.findProgramAddressSync([Buffer.from("ackee")], program.programId);
  const data2 = Keypair.generate();

  before("prepare", async () => {
    await airdrop(anchor.getProvider().connection, user.publicKey)
  })

  it("Unable to initialize with incorrect data account!", async () => {
    
    const not_pda_account = Keypair.generate(); // not PDA account
    
    try {
    const tx = await program.methods
      .initialize(1)
      .accountsStrict({
        user: user.publicKey,
        data: not_pda_account.publicKey,
        systemProgram: SystemProgram.programId
      })
      .signers([user])
      .rpc({});
      assert.fail(); // always fail if the instruction did not fail as expected!
    }
    catch(_err) {
      const err = anchor.AnchorError.parse(_err.logs);
      assert.strictEqual(err.error.errorCode.code, "ConstraintSeeds");
    }

    // console.log("Your transaction signature", tx);
    console.log("user account pubkey: ", user.publicKey.toString())
    console.log("data account pubkey: ", data)

  });


  it("Is initialized!", async () => {

    const tx = await program.methods
      .initialize(10)
      .accountsStrict({
        user: user.publicKey,
        data: data,
        systemProgram: SystemProgram.programId
      })
      .signers([user])
      .rpc({ commitment: "confirmed" });

      let dataAccount = await program.account.myData.fetch(data)
      assert.deepEqual(dataAccount.authority, user.publicKey)
      assert.strictEqual(dataAccount.counter, 0)

    // console.log("Your transaction signature", tx);
    // console.log("user account pubkey: ", user.publicKey.toString())
    // console.log("data account pubkey: ", data)

    // let t = await program.methods
    //   .initialize()
    //   .accountsStrict({
    //     user: user.publicKey,
    //     data: data2.publicKey,
    //     systemProgram: SystemProgram.programId
    //   })
    //   .signers([user, data2])
    //   .rpc();

  });
});


async function airdrop(connection: any, address: any, amount = 1000000000) {
  await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}
