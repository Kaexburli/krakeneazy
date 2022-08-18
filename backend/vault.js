import * as fs from 'fs'
import VaultClient from 'node-vault-client'

const token = fs.readFileSync('../../agent-token', 'utf8')
const vaultClient = VaultClient.boot('krakeneazy', {
  api: { url: 'http://localhost:8200/', apiVersion: 'v1' },
  auth: { type: 'token', config: { token } },
  logger: false
})

const getVaultDatas = async () => {
  console.log('getVaultDatasgetVaultDatasgetVaultDatasgetVaultDatas')
  try {
    const kv = await vaultClient.read('kv/secret/krakeneazy/env/prod')
    const db = await vaultClient.read('mongodb/creds/krakeneazy-app')

    return { kv: kv.__data, db: db.__data }
  } catch (e) {
    console.error(e.message)
  }
}

export default getVaultDatas
