const forge = require('node-forge');

forge.options.usePureJavaScript = true;

// Synchronously generate a 2048-bit RSA keypair in pure JS
const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });

// Convert to PEM format (identical output structure to Node's native crypto)
const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

console.log(publicKeyPem);
console.log(privateKeyPem);