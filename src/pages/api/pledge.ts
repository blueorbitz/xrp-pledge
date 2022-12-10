import type { NextApiRequest, NextApiResponse } from 'next/types'
import connection from 'src/@core/utils/mongo-connection'

interface PledgeQueryType {
  limit?: number
}

interface PledgeBodyType {
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
  console.log('env', process.env.MONGODB_URI)

  try {
    switch (method) {
      case 'GET':
        res.status(200).send(await getPledges(req.query))
        break;
      case 'POST':
        res.status(200).send(await insertPledge(req.body))
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
  if (query.limit != null)
    delete query.limit

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