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
