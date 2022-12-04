import type { NextApiRequest, NextApiResponse } from 'next/types'
import type { SdkTypes } from 'xumm-sdk'
import { XummSdk } from 'xumm-sdk'

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const method = req.method?.toUpperCase()

  try {
    switch (method) {
      case 'POST':
        res.status(200).send(await createPayload(JSON.parse(req.body)))
        break;
      default:
        res.status(405).send({})
    }
  } catch (e) {
    console.error(e)
    res.status(500).send({})
  }
}

export async function createPayload(payload: SdkTypes.CreatePayload) {
  const xumm = new XummSdk(process.env.XUMM_API_KEY, process.env.XUMM_API_SECRET)
  const response = await xumm.payload.create(payload, true)
  return response
}
