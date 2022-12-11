import { ObjectId } from 'mongodb'
import type { NextApiRequest, NextApiResponse } from 'next/types'
import connection from 'src/@core/utils/mongo-connection'

interface PledgeQueryType {
  _id?: string | ObjectId
  limit?: number
}

interface PledgeBodyType {
  _id: string | ObjectId
  title: string
  description: string
  nftCount: number
  nftPrice: number
  nftUri: string
  tokens: string[],
  owner: string,
  identityUrl: string | undefined,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const method = req.method?.toUpperCase()
  const result = {}

  try {
    switch (method) {
      case 'GET':
        res.status(200).send(await getPledges(req.query))
        break;
      case 'POST':
        res.status(200).send(await insertPledge(req.body))
        break;
      case 'PUT':
        res.status(200).send(await updatePledge(req.body))
        break;
      default:
        res.status(405).send({})
    }
  } catch (e) {
    console.error(e)
    res.status(500).send({})
  }
}

async function getPledges(query: PledgeQueryType): Promise<any> {
  const client = await connection
  const db = client.db(process.env.MONGODB_DB)

  let limit = query.limit ?? 50
  delete query.limit

  if (query._id)
    query._id = new ObjectId(query._id)

  const results = await db.collection(process.env.MONGODB_COLLECTION)
    .find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();

  return results;
}

async function insertPledge(body: PledgeBodyType): Promise<void> {
  const client = await connection
  const db = client.db(process.env.MONGODB_DB)
  const result = await db.collection(process.env.MONGODB_COLLECTION)
    .insertOne(body)
  return result
}

async function updatePledge(body: PledgeBodyType): Promise<void> {
  const client = await connection
  const db = client.db(process.env.MONGODB_DB)

  const query = { _id: new ObjectId(body._id) }
  const newValues = Object.assign(body)
  delete newValues._id
  delete newValues.owner
  delete newValues.nftCount
  delete newValues.nftUri

  const result = await db.collection(process.env.MONGODB_COLLECTION)
    .updateOne(query, { $set: newValues })
  return result
}
