import { ObjectId } from 'mongodb'
import type { NextApiRequest, NextApiResponse } from 'next/types'
import connection from 'src/@core/utils/mongo-connection'
import * as xrpl from 'xrpl'

interface BrokerBodyType {
  buyer: string
  buyOfferId: string
  sellOfferId: string
  network: string
  mongoId: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const method = req.method?.toUpperCase()

  try {
    switch (method) {
      case 'POST':
        res.status(200).send(await brokerSale(req.body))
        break;
      default:
        res.status(405).send({})
    }
  } catch (e) {
    console.error(e)
    res.status(500).send({})
  }
}

async function brokerSale(body: BrokerBodyType): Promise<any> {
  const broker_wallet = xrpl.Wallet.fromSeed(process.env.XRP_BROKER_SEED ?? '')
  const xrpClient = new xrpl.Client(body.network)
  await xrpClient.connect()

  const transactionBlob = {
    TransactionType: 'NFTokenAcceptOffer',
    Account: broker_wallet.classicAddress,
    NFTokenSellOffer: body.sellOfferId,
    NFTokenBuyOffer: body.buyOfferId,
    NFTokenBrokerFee: xrpl.xrpToDrops(0.1)
  }

  //@ts-ignore
  const tx = await xrpClient.submitAndWait(transactionBlob, { wallet: broker_wallet })
  console.log('broker sales', tx)
  xrpClient.disconnect()

  // Store Mongo
  const monClient = await connection
  const db = monClient.db(process.env.MONGODB_DB)

  const query = { _id: new ObjectId(body.mongoId) }
  const dbData = await db.collection(process.env.MONGODB_COLLECTION)
    .findOne(query)
  
  const tokenId = dbData.tokens.shift()
  const result = await db.collection(process.env.MONGODB_COLLECTION)
    .updateOne(query, { $set: {
      tokens: dbData.tokens,
      sales: [...(dbData.sales ?? []), { tokenId, buyer: body.buyer }]
    } })
  return result
}
