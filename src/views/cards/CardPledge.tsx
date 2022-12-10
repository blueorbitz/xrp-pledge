// ** React Imports// ** React Imports
import React, { useState, FormEvent } from 'react'
import type { MouseEvent, Dispatch, SetStateAction } from 'react'
import { useUpdateEffect } from 'usehooks-ts'
import Image from 'next/image'
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Collapse from '@mui/material/Collapse'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import CardHeader from '@mui/material/CardHeader'
import Modal from '@mui/material/Modal'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'

// ** Icons Imports
import ChevronUp from 'mdi-material-ui/ChevronUp'
import ChevronDown from 'mdi-material-ui/ChevronDown'
import ShareVariant from 'mdi-material-ui/ShareVariant'

// ** Custom Components Imports
import type { SdkTypes } from 'xumm-sdk'
import * as xrplHelper from 'src/@core/utils/xrpl-helper'
import CenterModalWrapper from 'src/@core/styles/libs/react-centermodal'

interface CardPledgeType {
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

interface PledgeFormDataType {
  amount: { value: number };
}

interface PledgeModalType {
  openState: [boolean, Dispatch<SetStateAction<boolean>>]
}

const PledgeModal = (props: PledgeModalType & CardPledgeType) => {
  const [open, setOpen] = props.openState
  const [signBuyOffer, setSignBuyOffer] = useState<SdkTypes.XummPostPayloadResponse | null>(null)
  const [signSocket, setSignSocket] = useState<WebSocket | null>(null)

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
      const amountInDrops = amount.value * 1000000

      const xummData = await fetch('/api/xumm', {
        method: 'POST',
        body: JSON.stringify({
          'TransactionType': 'NFTokenCreateOffer',
          'Owner': props.owner,
          'NFTokenID': props.tokens[0],
          'Amount': amountInDrops,
          'Flags': null,
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
        // fetch owner address
        // get buy/sell id
        // broker sales
        // update mongodb
      }
    }
  }, [signBuyOffer, signSocket])

  const InputAmountComponent = () =>
    <form onSubmit={onSubmit}>
      <Grid container spacing={5}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            type='number'
            label='Amount'
            name='amount'
            placeholder='value in XRP'
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

const CardPledge = (props: CardPledgeType) => {
  // ** State
  const shortDescSize = 180
  const pledgeModalState = useState<boolean>(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [collapse, setCollapse] = useState<boolean>(false)

  const handleCollapse = () => {
    setCollapse(!collapse)
  }

  const open = Boolean(anchorEl)

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handlePledge = () => {
    pledgeModalState[1](true)
  }

  const flexInBetween = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }

  return (
    <Card>
      <CardMedia sx={{ height: '14.5625rem' }} image={props.nftUri} />
      <CardContent>
        <Typography variant='h6' sx={{ marginBottom: 2 }}>
          {props.title}
        </Typography>
        <Box sx={flexInBetween}>
          <Typography variant='caption'>
            {'Available: ' + props.tokens.length + '/' + props.nftCount}
          </Typography>
          <Typography variant='caption'>
            {window.xrpl.dropsToXrp(props.nftPrice) + ' XRP'}
          </Typography>
        </Box>
        <Typography variant='body2'>
          {props.description.substring(0, shortDescSize)}
        </Typography>
      </CardContent>
      <CardActions className='card-action-dense'>
        <Box sx={flexInBetween}>
          <Button onClick={handlePledge}>Pledge</Button>
          <div>
            <IconButton
              id='long-button'
              aria-label='share'
              aria-haspopup='true'
              onClick={handleClick}
              aria-controls='long-menu'
              aria-expanded={open ? 'true' : undefined}
            >
              <ShareVariant fontSize='small' />
            </IconButton>
            {
              props.description.length > shortDescSize &&
              <IconButton size='small' onClick={handleCollapse}>
                {collapse ? <ChevronUp sx={{ fontSize: '1.875rem' }} /> : <ChevronDown sx={{ fontSize: '1.875rem' }} />}
              </IconButton>
            }
          </div>
        </Box>
      </CardActions>
      <Collapse in={collapse}>
        <Divider sx={{ margin: 0 }} />
        <CardContent>
          <Typography variant='body2'>
            {props.description}
          </Typography>
        </CardContent>
      </Collapse>
      <PledgeModal openState={pledgeModalState} {...props} />
    </Card>
  )
}

export default CardPledge
