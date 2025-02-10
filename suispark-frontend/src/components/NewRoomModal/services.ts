import { EnokiFlow } from "@mysten/enoki";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";

const NETWORK = import.meta.env.VITE_APP_NETWORK;
const PACKAGE_ID = import.meta.env.VITE_APP_PACKAGE_ID;

const convertSuiToMist = (suiAmount: number) => {
  return Math.floor(suiAmount * 10 ** 9);
};

export const getBalance = async (walletAddress: string) => {
  const rpcUrl = getFullnodeUrl(NETWORK);

  const suiClient = new SuiClient({ url: rpcUrl });
  const balanceObj = await suiClient.getCoins({
    owner: walletAddress,
    limit: 100,
  });

  const balance = balanceObj.data
    .filter((coinObj) => coinObj.coinType === "0x2::sui::SUI")
    .reduce((acc, obj) => acc + parseInt(obj.balance), 0);
  return balance;
};

export const paySuiForSubmit = async (
  description: string,
  fee: number,
  flow: EnokiFlow
) => {
  try {
    const rpcUrl = getFullnodeUrl(NETWORK);
    const suiClient = new SuiClient({ url: rpcUrl });
    const keypair = await flow.getKeypair({ network: NETWORK });

    const txb = new TransactionBlock();
    const [coin] = txb.splitCoins(txb.gas, [txb.pure(convertSuiToMist(fee))]);
    txb.moveCall({
      target: `${PACKAGE_ID}::dao_sui::submit_project`,
      arguments: [txb.pure(description), coin],
    });

    const txnRes = await suiClient.signAndExecuteTransactionBlock({
      signer: keypair,
      transactionBlock: txb,
    });
    const digest = txnRes.digest;
    console.log("digest", digest);

    return txnRes;
  } catch (error) {
    console.error("Error in paySuiForSubmit:", error);
    throw error;
  }
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getTransactionDetails(digest: string, maxRetries = 5) {
  const rpcUrl = getFullnodeUrl(NETWORK);
  const suiClient = new SuiClient({ url: rpcUrl });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await delay(10000 * attempt);

      const txnDetails = await suiClient.getTransactionBlock({
        digest: digest,
        options: {
          showEffects: true,
          showEvents: true,
          showInput: true,
          showObjectChanges: true,
        },
      });

      const sharedObjects = txnDetails.objectChanges;
      return {
        txnDetails,
        sharedObjects,
      };
    } catch (error) {
      if (attempt === maxRetries) {
        console.error(`Failed after ${maxRetries} attempts:`, error);
        throw error;
      }
      console.log(`Attempt ${attempt} failed, retrying...`);
    }
  }
}

export async function extractProjectObjectId(txnDetails: any) {
  if (!txnDetails || !txnDetails.txnDetails || !txnDetails.txnDetails.effects) {
    console.error("Invalid transaction details format");
    return null;
  }

  const objectChanges = txnDetails.txnDetails.objectChanges;
  if (!objectChanges || objectChanges.length === 0) {
    console.log("No object changes found in transaction.");
    return null;
  }

  const projectObject = objectChanges.find(
    (change: any) =>
      change.type === "created" &&
      change.objectType.endsWith("::dao_sui::Project")
  );

  if (!projectObject) {
    console.log("No Project object found in transaction.");
    return null;
  }

  return projectObject.objectId;
}
