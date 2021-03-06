const fs = require("fs");
const path = require("path");

const jsonld = require("jsonld");

const resolver = require("./resolver");

const loadContext = relativePath => {
  return JSON.parse(
    fs.readFileSync(path.resolve(__dirname, relativePath)).toString()
  );
};

const contexts = {
  "https://www.w3.org/2018/credentials/v1": loadContext(
    "../../docs/context/credentials-v1.jsonld"
  ),
  "https://w3c-ccg.github.io/vc-json-schemas/context/hypothetical-examples/trade-certificates-v0.0.jsonld": loadContext(
    "../../docs/context/hypothetical-examples/trade-certificates-v0.0.jsonld"
  ),
  "https://w3id.org/did/v1": loadContext("../../docs/context/did-v1.jsonld"),
  "https://w3id.org/security/v1": loadContext(
    "../../docs/context/security-v1.jsonld"
  ),
  "https://w3id.org/security/v2": loadContext(
    "../../docs/context/security-v2.jsonld"
  )
};

const documentLoader = async url => {
  // console.log(url);
  if (url.indexOf("did:") === 0) {
    const didDoc = resolver.resolve(url);
    return {
      contextUrl: null, // this is for a context via a link header
      document: didDoc, // this is the actual document that was loaded
      documentUrl: url // this is the actual context URL after redirects
    };
  }

  const context = contexts[url];

  if (context) {
    return {
      contextUrl: null, // this is for a context via a link header
      document: context, // this is the actual document that was loaded
      documentUrl: url // this is the actual context URL after redirects
    };
  }

  try {
    return jsonld.documentLoader(url);
  } catch (e) {
    console.error("No remote context support for " + url);
  }

  console.error("No custom context support for " + url);
  throw new Error("No custom context support for " + url);
};

module.exports = documentLoader;
