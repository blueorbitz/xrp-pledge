export interface XummSignedEventMessage {
  expired?: boolean,
  payload_uuidv4: string,
  reference_call_uuidv4: string,
  signed: boolean,
  user_token: boolean,
  return_url: {
    app: string | null,
    web: string | null,
  },
  txid: string,
  opened_by_deeplink: boolean,
  custom_meta: {
    identifier: string | null,
    blob: string | null,
    instruction: string | null,
  }
}

export function toHex(text: string) {
  const arr = []
  for (var i = 0; i < text.length; i++)
    arr.push((text.charCodeAt(i).toString(16)).slice(-4))

  return arr.join('')
}
