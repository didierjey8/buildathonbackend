const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000;
const { signTransaction, sendSignedTransaction } = require("./services/blockchainService");
const { BASESEPOLIARPC, BASESEPOLIACHAINID, BASESEPOLIAEXPLORER } = require("./config");

app.use(express.json());

app.use(cors());

app.post("/api/call-request", async (req, res) => {
  const { phoneNumber, walletAddress, topic } = req.body;

  if (!phoneNumber || !walletAddress || !topic) {
    return res.status(400).json({ error: "All fields are required: phoneNumber, walletAddress, topic" });
  }

  console.log(`Phone Number: ${phoneNumber}`);
  console.log(`Wallet Address: ${walletAddress}`);
  console.log(`Topic: ${topic}`);

  const dataToSend = {
    name: "Coiner",
    number: "+" + phoneNumber,
    document: topic,
    nameBot: process.env.NAMEBOT,
    lang: "en",
  };

  console.log(dataToSend);

  try {
    const response = await axios.post(process.env.APICALL, dataToSend);
    console.log("Response from external service:", response);

    res.json({
      message: "Data received and forwarded successfully",
      receivedData: { phoneNumber, walletAddress, topic },
      externalServiceResponse: response.data,
    });

    const result = await signTransaction("Send transaction", BASESEPOLIARPC, BASESEPOLIACHAINID);

    sendSignedTransaction(result.rawTransaction, BASESEPOLIARPC, BASESEPOLIAEXPLORER);

    res.json({
      chainName: "basesepolia",
      hash: result.transactionHash,
      explorer: BASESEPOLIAEXPLORER + result.transactionHash,
    });
  } catch (error) {
    console.error("Error calling external service:", error);
    res.status(500).json({ error: "Failed to forward data to external service" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
