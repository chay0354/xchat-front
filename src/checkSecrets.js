const required = ["REACT_APP_API_URL"];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  throw new Error(`Missing env var(s): ${missing.join(", ")}. Set them in Amplify → Environment variables.`);
}
