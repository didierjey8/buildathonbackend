const Web3 = require("web3");
const { KEYSTORE } = require("../config");
const fs = require("fs");

async function getNextNonceAndRegister(chainId, rpcUrl, address) {
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
  const nonceFilePath = `./src/nonces/nonces${chainId}.txt`;
  let nonce = "";

  try {
    const data = fs.readFileSync(nonceFilePath, "utf8");
    const lastNonce = parseInt(data);

    if (!isNaN(lastNonce)) {
      nonce = lastNonce + 1;
    } else {
      nonce = await web3.eth.getTransactionCount(address);
    }
  } catch (error) {
    console.log("Nonce register", error);
  }

  fs.writeFileSync(nonceFilePath, nonce.toString());

  return nonce;
}

const blockchainService = {
  async getBalance(wallet, rpcUrl) {
    const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
    return await web3.eth.getBalance(wallet);
  },

  async getTransaction(transactionId, rpcUrl) {
    const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
    return await web3.eth.getTransaction(transactionId);
  },

  async signTransaction(textSave, rpcUrl, chainId, toUser) {
    const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
    const dataTimeNow = new Date().toISOString();

    const decryptedAccount = web3.eth.accounts.privateKeyToAccount(KEYSTORE);
    console.log(decryptedAccount.address);

    const gasLimit = 50000; //calculateGas(textSave);
    const amountInMatic = 0.001;
    const amountInWei = web3.utils.toWei(amountInMatic.toString(), "ether");

    const rawTransaction = {
      from: decryptedAccount.address,
      to: toUser,
      value: amountInWei,
      gas: gasLimit,

      input: Buffer.from(textSave + " " + dataTimeNow, "utf-8").toString("hex"),
      maxPriorityFeePerGas: "10000000000",
      maxFeePerGas: "60000000000",
    };
    console.log("rawTransaction:", JSON.stringify(rawTransaction));
    const signedTx = await decryptedAccount.signTransaction(rawTransaction);
    console.log("signed:", JSON.stringify(signedTx));
    return signedTx;
  },

  async sendSignedTransaction(signedTx, rpcUrl, urlExplorer) {
    try {
      const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

      const receipt = await web3.eth.sendSignedTransaction(signedTx);

      return {
        successData: receipt.status,
        hash: receipt.transactionHash,
        explorer: urlExplorer + receipt.transactionHash,
      };
    } catch (error) {
      console.error("Error al enviar la transacción firmada:", error);
    }
  },
};

module.exports = blockchainService;
