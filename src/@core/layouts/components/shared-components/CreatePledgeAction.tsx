// ** React Imports
import React, { useState, FormEvent } from 'react'
import { useUpdateEffect } from 'usehooks-ts'

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
import * as xrplHelper from 'src/@core/utils/xrpl-helper'
import CenterModalWrapper from 'src/@core/styles/libs/react-centermodal'
import useXrplNetwork from 'src/@core/hooks/useXrplNetwork'

// ** Icons Imports
import MessageOutline from 'mdi-material-ui/MessageOutline'
import PanoramaOutline from 'mdi-material-ui/PanoramaOutline'
import CreditCardOutline from 'mdi-material-ui/CreditCardOutline'
import VoteOutline from 'mdi-material-ui/VoteOutline'
import AccountBoxOutline from 'mdi-material-ui/AccountBoxOutline'
import { Typography } from '@mui/material'

interface PledgeFormDataType {
  title: { value: string };
  description: { value: string };
  nftCount: { value: number };
  nftPrice: { value: number };
  identityUrl: { value: string };
}

interface PledgeDetailsType {
  title?: string;
  description?: string;
  nftCount?: number;
  nftPrice?: number;
  identityUrl?: string;
  nftUri?: string;
  seedToken?: string;
}

const FormButtons = ({ onClose, submitDisabled = false }: { onClose?: () => void; submitDisabled?: boolean }) =>
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
      {
        onClose && <Button onClick={onClose} variant='text' size='large' sx={{ marginRight: 2 }}>
          Close
        </Button>
      }
      {
        !submitDisabled && <Button type='submit' variant='contained' size='large'>
          Next
        </Button>
      }
    </div>
  </Box>

const CreatePledgeAction = () => {
  // ** States
  const [open, setOpen] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [details, setDetails] = useState<PledgeDetailsType | null>(null)
  const [createdNFT, setCreatedNFT] = useState<boolean>(false)
  const { network } = useXrplNetwork()

  // ** Functions
  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setFileError(null)
    setDetails(null)
    setCreatedNFT(false)
    setOpen(false)
  }

  const onSubmitDetails = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      // Handle Form details
      const {
        title, description, nftCount, nftPrice, identityUrl,
      } = e.target as typeof e.target & PledgeFormDataType;

      const details = {
        title: title.value,
        description: description.value,
        nftCount: nftCount.value,
        nftPrice: nftPrice.value,
        identityUrl: identityUrl.value,
      }

      // Handle Form image
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

      setDetails({
        ...details,
        nftUri: xrplHelper.toHex(cloudinaryData.secure_url),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const onSubmitSeed = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const { seed } = e.target as typeof e.target & { seed: { value: string; } }
    const seedToken = seed.value
    setDetails({ ...details, seedToken: seedToken })

    await processNFTTransactions()
  }

  const processNFTTransactions = async () => {
    // TODO: xrpl mint & create sell offer

    setCreatedNFT(true)
  }

  const SubmitDetailsComponent = () =>
    <form onSubmit={onSubmitDetails}>
      <Grid container spacing={5}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label='Title'
            name='title'
            placeholder='What is this for?'
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
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
            required
            multiline
            minRows={3}
            label='Description'
            name='description'
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
            required
            type='number'
            label='Total Available NFT'
            name='nftCount'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <VoteOutline />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            type='number'
            label='Price per NFT'
            name='nftPrice'
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
          <TextField
            fullWidth
            label='Proof of identity'
            name='identityUrl'
            placeholder='https://example.com'
            helperText='A link that can proof XRP account belongs to you'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <AccountBoxOutline />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <FormButtons onClose={handleClose} />
        </Grid>
      </Grid>
    </form>

  const SubmitSeedTokenComponent = () =>
    <form onSubmit={onSubmitSeed}>
      <Grid container spacing={5}>
        <Grid item xs={12}>
          <Typography variant='body1'>
            Seed token is needed to ease back and forth of individually signed to Mint
            and Create Sell Offer for us (the broker) to transact on behalf of you.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label='Seed token'
            name='seed'
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant='body2'>
            * Seed token is only being used on the browser. Due to security reason, the
            seed token won't be stored anywhere.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <FormButtons onClose={handleClose} />
        </Grid>
      </Grid>
    </form>

  const ProcessNFTComponent = () =>
    <Grid container spacing={5}>
      <Grid item xs={12}>
        <Typography variant='h5'>
          Minting/CreateSellOffer NFT #1
        </Typography>
      </Grid>
    </Grid>

  const CompletedComponent = () =>
    <Grid container spacing={5}>
      <Grid item xs={12}>
        <Typography variant='body1'>
          All NFT is ready for supporters to pledge!
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <FormButtons onClose={handleClose} submitDisabled />
      </Grid>
    </Grid>

  const AutoWizardComponent = () => {
    if (details === null)
      return <SubmitDetailsComponent />
    else if (details.seedToken == null)
      return <SubmitSeedTokenComponent />
    else if (createdNFT === false)
      return <ProcessNFTComponent />
    else
      return <CompletedComponent />
  }

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
            <AutoWizardComponent />
          </CardContent>
        </Box>
      </Modal>
    </React.Fragment>
  )
}

export default CreatePledgeAction