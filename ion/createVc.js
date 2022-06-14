const ION = require('@decentralized-identity/ion-tools')
const fs = require('fs').promises
const main = async () => {
  const privateKey = JSON.parse(await fs.readFile('privateKey.json'))
  const myData = 'This message is signed and cannot be tampered with'
  const signature = await ION.signJws({
    payload: myData,
    privateJwk: privateKey
  });
  console.log("Signed JWS:", signature)
  const randomKeyPair = await ION.generateKeyPair('secp256k1')
  let verifiedJws = await ION.verifyJws({
    jws: signature,
    publicJwk: randomKeyPair.publicJwk
  })
  console.log("Verify with random new key:", verifiedJws)
  const publicKey = JSON.parse(await fs.readFile('publicKey.json'))
  verifiedJws = await ION.verifyJws({
    jws: signature,
    publicJwk: publicKey
  })
  console.log("Verify with my public key:", verifiedJws)
}
main()
