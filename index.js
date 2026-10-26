const { feathers } = require("@feathersjs/feathers");
const express = require("@feathersjs/express");
const socketio = require("@feathersjs/socketio");
const forge = require("node-forge");

forge.options.usePureJavaScript = true;

const app = express(feathers());

const serverKeyPair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });

app.configure(socketio((io) => {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    let sharedAesKeyBytes = null;

    const asn1PubKey = forge.pki.publicKeyToAsn1(serverKeyPair.publicKey);
    const derBytes = forge.asn1.toDer(asn1PubKey).getBytes();
    const rawPublicKeyArray = Array.from(forge.util.binary.raw.decode(derBytes));

    socket.emit("handshake", {
      publicKey: rawPublicKeyArray
    });

    socket.on("handshake", (data) => {
      try {
        const encryptedKeyBytes = forge.util.binary.raw.encode(new Uint8Array(data.encryptedKey));

        sharedAesKeyBytes = serverKeyPair.privateKey.decrypt(
          encryptedKeyBytes,
          "RSA-OAEP",
          { md: forge.md.sha256.create() }
        );

        console.log(`[${socket.id}] Shared AES key established successfully!`);
      } catch (err) {
        console.error(`[${socket.id}] Handshake failed:`, err.message);
      }
    });

    socket.on("test", (payload) => {
      if (!sharedAesKeyBytes) {
        console.error("Received message before handshake finished!");
        return;
      }

      try {
        const iv = forge.util.binary.raw.encode(new Uint8Array(payload.iv));
        const fullData = forge.util.binary.raw.encode(new Uint8Array(payload.data));

        const tag = fullData.slice(-16);
        const ciphertext = fullData.slice(0, -16);

        const decipher = forge.cipher.createDecipher("AES-GCM", sharedAesKeyBytes);
        decipher.start({
          iv: iv,
          tag: forge.util.createBuffer(tag)
        });
        decipher.update(forge.util.createBuffer(ciphertext));

        if (decipher.finish()) {
          const decryptedText = decipher.output.toString("utf8");
          console.log(`[Decrypted from ${socket.id}]:`, decryptedText);
        } else {
          console.error("Authentication tag check failed!");
        }
      } catch (err) {
        console.error("Decryption error:", err.message);
      }
    });
  });
}));

app.use(express.static('site'));

app.listen(3030, () => {
  console.log("Server listening at http://localhost:3030");
});