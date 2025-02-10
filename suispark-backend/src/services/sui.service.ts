import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
const client = new SuiClient({ url: getFullnodeUrl('testnet') });

const packageId = '0x5be044aa691a92656988cd3229ea77b3c3bffd4692ec50fa1a8db40b6fc23136';
const moduleName = 'dao_sui';

export const approveProject = async (trueVotes: number, projectId: string) => {
  const tx = new Transaction();
  const keypair = Ed25519Keypair.deriveKeypair(process.env.MNEMONICS);
  const functionName = 'approve_project';

  tx.moveCall({
    target: `${packageId}::${moduleName}::${functionName}`,
    arguments: [tx.pure.u8(trueVotes), tx.object(projectId)],
  });

  try {
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
    });
    const transaction = await client.waitForTransaction({
      digest: result.digest,
      options: {
        showEffects: true,
      },
    });
    console.log(`Transaction Digest: ${transaction.digest}`);
    return transaction;
  } catch (e) {
    console.error(`Failed to approve project:`, e);
    throw e;
  }
};
