// ** React Imports
import React, { useState, FormEvent } from 'react'
import { useUpdateEffect } from 'usehooks-ts'
import Image from 'next/image'
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Modal from '@mui/material/Modal'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'

// ** Custom Components Imports
import { SdkTypes } from 'xumm-sdk'
import * as xrplHelper from 'src/@core/utils/xrpl-helper'
import CenterModalWrapper from 'src/@core/styles/libs/react-centermodal'

// ** Icons Imports
import MessageOutline from 'mdi-material-ui/MessageOutline'
import PanoramaOutline from 'mdi-material-ui/PanoramaOutline'
import CreditCardOutline from 'mdi-material-ui/CreditCardOutline'


const CreatePledgeAction = () => {
  // ** States
  const [open, setOpen] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [signMintNFTPayload, setSignMintNFTPayload] = useState<SdkTypes.XummPostPayloadResponse | null>(null)
  let mintNFTSocket: WebSocket | null = null

  // ** Functions
  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    if (mintNFTSocket !== null) {
      mintNFTSocket.close()
      mintNFTSocket = null
    }
    setSignMintNFTPayload(null)
    setOpen(false)
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()
      setFileError(null)

      const fileInput = Array.from(e.target as any)
        .find(({ name }: any) => name === 'file') as HTMLInputElement

      const formData = new FormData()
      for (const file of fileInput.files ?? []) {
        if (file.size > 3 * 1048576) { // larger than 3MB is reject
          setFileError('Less than 3MB file size only')
          return
        }
        formData.append('file', file)
      }
      formData.append('upload_preset', 'xrp-pledge')

      const cloudinaryData = { secure_url: 'https://www.google.com' }
      // const cloudinaryData = await fetch('https://api.cloudinary.com/v1_1/dufqxigjz/image/upload', {
      //   method: 'POST',
      //   body: formData
      // }).then(resp => resp.json())
      // console.log(cloudinaryData.secure_url)

      const xummMintData = await fetch('/api/xumm', {
        method: 'POST',
        body: JSON.stringify({
          'TransactionType': 'NFTokenMint',
          // 'Account': standby_wallet.classicAddress, // to be filled by Xumm on Signed
          'URI': xrplHelper.toHex(cloudinaryData.secure_url),
          'Flags': 8, // for tsTransferable 
          'TransferFee': 0,
          'NFTokenTaxon': 0 //Required, but if you have no use for it, set to zero.
        })
      }).then(resp => resp.json())

      console.log(xummMintData)
      setSignMintNFTPayload(xummMintData)
    } catch (error) {
      console.error(error)
    }
  }

  useUpdateEffect(() => {
    if (signMintNFTPayload === null)
      return

    if (mintNFTSocket !== null)
      return

    console.log('conneting to ', signMintNFTPayload.refs.websocket_status)
    mintNFTSocket = new WebSocket(signMintNFTPayload.refs.websocket_status)
    mintNFTSocket.onopen = (ev: Event) => {
      console.log('MintNFT listening to socket connected')
    }
    mintNFTSocket.onmessage = async (ev: MessageEvent<any>) => {
      const data = JSON.parse(ev.data) as xrplHelper.XummSignedEventMessage;
      if (data.expired && mintNFTSocket !== null)
        handleClose()

      if (data.signed) {
        console.log('MintNFT signed data:', data)
        // fetch xrp ledger for token ID
        // create sell offer
      }
    }
  }, [signMintNFTPayload])

  const SubmitDetailsComponent = () =>
    <form onSubmit={onSubmit}>
      <Grid container spacing={5}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            // required
            label='Title'
            placeholder='What is this for?'
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            // required
            type='file'
            name='file'
            label='Image'
            error={fileError !== null}
            helperText={fileError}
            inputProps={{
              accept: 'image/*',
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <PanoramaOutline />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            // required
            multiline
            minRows={3}
            label='Description'
            placeholder='Details here...'
            sx={{ '& .MuiOutlinedInput-root': { alignItems: 'baseline' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <MessageOutline />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            // required
            type='number'
            label='Require pledge amount'
            placeholder='value in XRP'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <CreditCardOutline />
                </InputAdornment>
              )
            }}
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
            <div>
              <Button onClick={handleClose} variant='text' size='large' sx={{ marginRight: 2 }}>
                Close
              </Button>
              <Button type='submit' variant='contained' size='large'>
                Create
              </Button>
            </div>
          </Box>
        </Grid>
      </Grid>
    </form>

  const SignMintNFTComponent = () =>
    <Grid container spacing={5}>
      <Grid item xs={12}>
        <Image
          alt="payment qr"
          src={signMintNFTPayload?.refs.qr_png ?? ''}
          width={200}
          height={200}
        />
      </Grid>
      <Grid item xs={12}>
        <Link href={signMintNFTPayload?.next.always ?? ''}>
          MintNFT via Xumm sign link
        </Link>
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

  return (
    <React.Fragment>
      <Button variant='contained' onClick={handleOpen} sx={{ mr: 5 }}>Create Pledge</Button>
      <Modal
        open={open}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={CenterModalWrapper}>
          <CardHeader title='Create a New Pledge' titleTypographyProps={{ variant: 'h6' }} />
          <CardContent>
            {
              signMintNFTPayload === null
                ? <SubmitDetailsComponent />
                : <SignMintNFTComponent />
            }
          </CardContent>
        </Box>
      </Modal>
    </React.Fragment>
  )
}

export default CreatePledgeAction