// ** React Imports// ** React Imports
import React, { useState, FormEvent } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { useUpdateEffect } from 'usehooks-ts'
import Image from 'next/image'
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Modal from '@mui/material/Modal'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'

// ** Icons Imports

// ** Custom Components Imports
import type { SdkTypes } from 'xumm-sdk'
import * as xrplHelper from 'src/@core/utils/xrpl-helper'
import CenterModalWrapper from 'src/@core/styles/libs/react-centermodal'
import useXrplNetwork from 'src/@core/hooks/useXrplNetwork'


export interface PledgeFormDataType {
  amount: { value: number };
}

export interface PledgeModalType {
  openState: [boolean, Dispatch<SetStateAction<boolean>>]
  onSuccess?: () => Promise<void>
}

export interface CardPledgeType {
  _id: string
  title: string
  description: string
  identityUrl: string
  nftUri: string
  owner: string
  nftCount: number
  nftPrice: number
  tokens: string[]
}

const PledgeModal = (props: PledgeModalType & CardPledgeType) => {
  const [open, setOpen] = props.openState
  const [signBuyOffer, setSignBuyOffer] = useState<SdkTypes.XummPostPayloadResponse | null>(null)
  const [signSocket, setSignSocket] = useState<WebSocket | null>(null)
  const { getXrplWebsocketUrl } = useXrplNetwork()

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    if (signSocket !== null)
      signSocket.close()

    setSignSocket(null)
    setSignBuyOffer(null)
    setOpen(false)
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const { amount } = e.target as typeof e.target & PledgeFormDataType;
      const amountInDrops = parseInt(window.xrpl.xrpToDrops(amount.value))

      const xummData = await fetch('/api/xumm', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          TransactionType: 'NFTokenCreateOffer',
          Owner: props.owner,
          NFTokenID: props.tokens[0],
          Amount: amountInDrops,
        })
      }).then(resp => resp.json())

      console.log(xummData)
      setSignBuyOffer(xummData)
    } catch (error) {
      console.error(error)
    }
  }

  useUpdateEffect(() => {
    if (signBuyOffer === null)
      return

    if (signSocket !== null)
      return

    console.log('conneting to ', signBuyOffer.refs.websocket_status)
    const _socket = new WebSocket(signBuyOffer.refs.websocket_status)
    setSignSocket(_socket)

    _socket.onopen = (ev: Event) => {
      console.log('listening to websocket for sign event...')
    }
    _socket.onmessage = async (ev: MessageEvent<any>) => {
      const data = JSON.parse(ev.data) as xrplHelper.XummSignedEventMessage;
      if (data.expired && signSocket !== null)
        handleClose()

      if (data.signed) {
        console.log('xumm transaction signed:', data)
        console.log('tx', data.txid)

        // fetch owner address
        const client = new window.xrpl.Client('wss://s.altnet.rippletest.net:51233')
        await client.connect()
        const txInfo = await client.request({
          command: 'tx',
          transaction: data.txid,
        })
        const buyer = txInfo.result.Account

        // get buy/sell id
        const NFTokenID = props.tokens[0]
        const nftSellOffers = await client.request({
          method: 'nft_sell_offers',
          nft_id: NFTokenID
        })

        const nftBuyOffers = await client.request({
          method: 'nft_buy_offers',
          nft_id: NFTokenID
        })

        // broker sales
        client.disconnect()
        const sellOffer = nftSellOffers.result.offers.find(o => o.owner === props.owner)
        const buyOffer = nftBuyOffers.result.offers.find(o => o.owner === buyer)

        const brokerData = await fetch('/api/broker', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            network: getXrplWebsocketUrl(),
            buyer: buyer,
            buyOfferId: buyOffer.nft_offer_index,
            sellOfferId: sellOffer.nft_offer_index,
            mongoId: props._id,
          })
        }).then(resp => resp.json())
        console.log('Broker store', brokerData)

        // end
        if (props.onSuccess)
          await props.onSuccess()

        handleClose()
      }
    }
  }, [signBuyOffer, signSocket])

  const InputAmountComponent = () => {
    const [amount, setAmount] = useState<number>(0)
    return <form onSubmit={onSubmit}>
      <Grid container spacing={5}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            inputProps={{
              step: 'any',
            }}
            type='number'
            label='Amount'
            name='amount'
            placeholder='value in XRP'
            onChange={e => setAmount(parseFloat(e.target.value))}
            error={(!!amount) && (parseFloat(window.xrpl.xrpToDrops(amount)) < props.nftPrice + 100000)}
            helperText={`min pledge amount ${window.xrpl.dropsToXrp(props.nftPrice)} XRP + 0.1 XRP (Fee)`}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            disabled
            label='Broker Fee'
            value='0.1 XRP'
          />
        </Grid>
      </Grid>
      <Grid item xs={12} sx={{ marginTop: 10 }}>
        <Box
          sx={{
            gap: 5,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div />
          <div>
            <Button onClick={handleClose} variant='text' size='large' sx={{ marginRight: 2 }}>
              Close
            </Button>
            <Button type='submit' variant='contained' size='large'>
              Next
            </Button>
          </div>
        </Box>
      </Grid>
    </form >
  }

  const SignBuyOfferComponent = () =>
    <Grid container spacing={5}>
      <Grid item xs={12}>
        <Link href={signBuyOffer?.next.always ?? ''}>
          Create Buy Offer
        </Link>
      </Grid>
      <Grid item xs={12}>
        <Image
          alt="payment qr"
          src={signBuyOffer?.refs.qr_png ?? ''}
          width={200}
          height={200}
        />
      </Grid>
      <Grid item xs={12}>
        <Box
          sx={{
            gap: 5,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div />
          <Button onClick={handleClose} variant='text' size='large' sx={{ marginRight: 2 }}>
            Close
          </Button>
        </Box>
      </Grid>
    </Grid>

  const AutoWizardComponent = () => {
    if (signBuyOffer === null)
      return <InputAmountComponent />
    else
      return <SignBuyOfferComponent />
  }

  return (
    <Modal
      open={open}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box sx={CenterModalWrapper}>
        <CardHeader title='Pledge an amount' titleTypographyProps={{ variant: 'h6' }} />
        <CardContent>
          <AutoWizardComponent />
        </CardContent>
      </Box>
    </Modal>
  )
}

export default PledgeModal