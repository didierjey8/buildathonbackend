const { getBalance, getTransaction, signTransaction, sendSignedTransaction } = require("../services/blockchainService");
const { AUTHSTORE, AVALANCHERPC, AVALANCHECHAINID, AVALANCHEEXPLORER, BASESEPOLIARPC, BASESEPOLIACHAINID, BASESEPOLIAEXPLORER } = require("../config");

function getChainInfo(chainName) {
  const chainNameLowerCase = chainName.toLowerCase();
  switch (chainNameLowerCase) {
    case "avalanche":
      return {
        rpcUrl: AVALANCHERPC,
        chainId: AVALANCHECHAINID,
        urlExplorer: AVALANCHEEXPLORER,
      };
    case "basesepolia":
      return {
        rpcUrl: BASESEPOLIARPC,
        chainId: BASESEPOLIACHAINID,
        urlExplorer: BASESEPOLIAEXPLORER,
      };
    default:
      return null;
  }
}

const blockchainController = {
  async getBalance(req, res) {
    try {
      const { wallet } = req.body;
      const balance = await getBalance(wallet);
      res.json(balance);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  async getTransaction(req, res) {
    try {
      const { transactionId, chainName } = req.body;
      if (transactionId == undefined && chainName == undefined) {
        return res.send({ msg: "You must send the transactionId and chainName" });
      }
      const chainInfo = getChainInfo(chainName);

      if (!chainInfo) {
        return res.send({ msg: "You must send the Chain Name" });
      }
      const { rpcUrl, chainId, urlExplorer } = chainInfo;
      const result = await getTransaction(transactionId, rpcUrl, chainId, urlExplorer);
      res.json(result);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  async sendTransaction(req, res) {
    try {
      const { textSave, tokenSoft, chainName } = req.body;
      if (chainName == undefined) {
        return res.send({ msg: "You must send the chainName" });
      }
      if (tokenSoft !== AUTHSTORE) {
        return res.json({ msg: "You must send the Token of the Software" });
      }

      const chainInfo = getChainInfo(chainName);
      if (!chainInfo) {
        return res.send({ msg: "You must send the Chain Name" });
      }

      const { rpcUrl, chainId, urlExplorer } = chainInfo;

      const result = await signTransaction(textSave, rpcUrl, chainId);
      //console.log(result);
      sendSignedTransaction(result.rawTransaction, rpcUrl, urlExplorer);

      res.json({
        chainName: chainName,
        hash: result.transactionHash,
        explorer: urlExplorer + result.transactionHash,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: err });
    }
  },
};

module.exports = blockchainController;
