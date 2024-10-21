require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3004,
  KEYSTORE: process.env.KEYSTORE,
  PASSKEYSTORE: process.env.PASSKEYSTORE,
  AUTHSTORE: process.env.AUTHSTORE,

  BASESEPOLIARPC: process.env.BASESEPOLIARPC,
  BASESEPOLIACHAINID: process.env.BASESEPOLIACHAINID,
  BASESEPOLIAEXPLORER: process.env.BASESEPOLIAEXPLORER,
};
