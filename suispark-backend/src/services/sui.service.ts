import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
const client = new SuiClient({ url: getFullnodeUrl('testnet') });

const keypair = Ed25519Keypair.deriveKeypair(process.env.MNEMONICS);
const packageId = process.env.PACKAGE_ID;
const moduleName = process.env.MODULE_NAME;

export const approveProject = async (trueVotes: number, projectId: string) => {
  try {
    const tx = new Transaction();

    const functionName = 'approve_project';

    console.log('', trueVotes, projectId);
    const target = packageId+"::"+moduleName+"::"+functionName;
    console.log('target', target);
    tx.moveCall({
      target: target,
      arguments: [tx.pure.u8(2), tx.object(projectId)],
    });
    console.log('moveCall');
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
    });
    console.log('result', result);

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

export const getFunds = async (projectObjectId: string) => {
  try {
    // Create transaction block
    const tx = new Transaction();
    // Call the get_funds function
    const functionName = 'get_funds';
    const target = packageId+"::"+moduleName+"::"+functionName;

    tx.moveCall({
      target: target,
      arguments: [tx.gas, tx.object(projectObjectId)],
    });

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
