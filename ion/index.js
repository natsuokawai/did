const ION = require('@decentralized-identity/ion-tools')
const fs = require('fs').promises

const generateKeys = async () => {
  // Create private/public key pair
  const authnKeys = await ION.generateKeyPair('secp256k1')
  console.log("Created private/public key pair")
  console.log("Public key:", authnKeys.publicJwk)
  // Write private and public key to files
  await fs.writeFile(
    'publicKey.json', 
    JSON.stringify(authnKeys.publicJwk)
  )
  await fs.writeFile(
    'privateKey.json', 
    JSON.stringify(authnKeys.privateJwk)
  )
  console.log("Wrote public key to publicKey.json")
  console.log("Wrote private key to privateKey.json")

  return authnKeys.publicJwk
}

const createDID = async (publicJwk) => {
  const did = new ION.DID({
    content: {
      // Register the public key for authentication
      publicKeys: [
        {
          id: 'auth-key',
          type: 'EcdsaSecp256k1VerificationKey2019',
          publicKeyJwk: publicJwk,
          purposes: [ 'authentication' ]
        }
      ],
      // Register an IdentityHub as a service
      services: [
        {
          id: "IdentityHub",
          type: "IdentityHub",
          serviceEndpoint: {
            "@context": "schema.identity.foundation/hub",
            "@type": "UserServiceEndpoint",
            instance: [
              "did:test:hub.id",
            ]
          }
        }
      ]
    }
  })
  const didUri = await did.getURI('short');
  console.log("Generated DID:", didUri)

  return did
}

const anchor = async (did) => {
  const anchorRequestBody = await did.generateRequest()
  const anchorRequest = new ION.AnchorRequest(anchorRequestBody)
  const anchorResponse = await anchorRequest.submit()
  console.log(JSON.stringify(anchorResponse))
}

const main = async () => {
  const publicJwk = await generateKeys()
  const did = await createDID(publicJwk)
  await anchor(did)
}

main()
