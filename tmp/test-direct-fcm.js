require("dotenv").config({ path: "./.env" });
const { initFirebase } = require("./src/config/firebase.config.ts");
// We can't easily require TS directly like this in Node without ts-node
