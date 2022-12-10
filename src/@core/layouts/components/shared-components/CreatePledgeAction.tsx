// ** React Imports
import React, { useState, FormEvent } from 'react'

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
  nftCount: { value: string };
  nftPrice: { value: string };
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
  const { getXrplWebsocketUrl } = useXrplNetwork()
  const [open, setOpen] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [details, setDetails] = useState<PledgeDetailsType | null>(null)
  const [createdNFT, setCreatedNFT] = useState<boolean>(false)
  const [currentMintIndex, setCurrentMintIndex] = useState<number>(0)
  const [currentMintMsg, setCurrentMintMsg] = useState<string>('')

  // ** Functions
  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setFileError(null)
    setDetails(null)
    setCreatedNFT(false)
    setCurrentMintIndex(0)
    setCurrentMintMsg('')
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
        nftCount: parseInt(nftCount.value),
        nftPrice: parseFloat(nftPrice.value) * 1000000, // prince in drops
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

      // const cloudinaryData = { secure_url: 'https://www.google.com' }
      const cloudinaryData = await fetch('https://api.cloudinary.com/v1_1/dufqxigjz/image/upload', {
        method: 'POST',
        body: formData
      }).then(resp => resp.json())
      console.log(cloudinaryData.secure_url)

      setDetails({
        ...details,
        nftUri: window.xrpl.convertStringToHex(cloudinaryData.secure_url),
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

    await processNFTTransactions(seedToken)
  }

  const processNFTTransactions = async (seedToken: string) => {
    // BATCH MINT and Create Sell Offer
    // For details of the implementation, refer example from batch-minting
    //
    try {
      const CreatedNFTokenIDs: string[] = []

      const wallet = window.xrpl.Wallet.fromSeed(seedToken)
      const client = new window.xrpl.Client(getXrplWebsocketUrl())
      await client.connect()

      const account_info = await client.request({
        command: 'account_info',
        account: wallet.address
      })
      // console.log('account_info', account_info)

      const my_sequence = account_info.result.account_data.Sequence
      const nftokenCount = details?.nftCount || 1
      // console.log('Sequence Number:', my_sequence, nftokenCount)
      const ticketTransaction = await client.autofill({
        TransactionType: 'TicketCreate',
        Account: wallet.address,
        TicketCount: nftokenCount,
        Sequence: my_sequence
      })
      // console.log('ticketTransaction', ticketTransaction)

      const signedTransaction = wallet.sign(ticketTransaction)
      // console.log('signedTransaction', signedTransaction)
      const tx = await client.submitAndWait(signedTransaction.tx_blob)
      console.log('TicketCreate:', tx.result.meta.TransactionResult)

      let response = await client.request({
        command: 'account_objects',
        account: wallet.address,
        type: 'ticket'
      })

      let tickets: string[] = []
      for (let i = 0; i < nftokenCount; i++) {
        tickets[i] = response.result.account_objects[i].TicketSequence
      }

      console.log('Tickets generated, minting NFTTokens')

      setCurrentMintMsg('')
      const messages: string[] = []
      const MemoData = window.xrpl.convertStringToHex('XRP Pledge -' + details?.title)

      for (let i = 0; i < nftokenCount; i++) {
        setCurrentMintIndex(i + 1)

        const mintTransactionBlob = {
          TransactionType: 'NFTokenMint',
          Account: wallet.address,
          URI: details?.nftUri ?? '',
          Flags: 8,
          TransferFee: 0,
          Sequence: 0,
          TicketSequence: tickets[i],
          LastLedgerSequence: null,
          NFTokenTaxon: 0,
          Memos: [
            {
              Memo: {
                MemoData: MemoData
              }
            }
          ]
        }

        console.log('mintTransactionBlob', mintTransactionBlob)
        messages.push(`${i + 1}) TransactionType: ${mintTransactionBlob.TransactionType}`)
        setCurrentMintMsg(messages.join('\n'))

        const mintTx = await client.submitAndWait(mintTransactionBlob, { wallet: wallet })
        console.log('minted nft', mintTx)
        messages.push(`hash: ${mintTx.result.hash}`)

        const nodeWithNFTInfo = mintTx.result.meta.AffectedNodes.find(o => {
          const LedgerEntryType = 'NFTokenPage'
          if (o.ModifiedNode && o.ModifiedNode.LedgerEntryType)
            return o.ModifiedNode.LedgerEntryType === LedgerEntryType
          else if (o.CreatedNode && o.CreatedNode.LedgerEntryType)
            return o.CreatedNode.LedgerEntryType === LedgerEntryType
          else
            return false
        })

        const nodeAction = Object.keys(nodeWithNFTInfo)[0]
        console.log('NFT node', nodeAction, nodeWithNFTInfo)

        let NFTokenIDs: string[] = []

        if (nodeWithNFTInfo[nodeAction].NewFields) {
          NFTokenIDs = nodeWithNFTInfo[nodeAction].NewFields.NFTokens.map(o => o.NFToken.NFTokenID)
        }
        else {
          const PrevNFTokens = nodeWithNFTInfo[nodeAction].PreviousFields.NFTokens.map(o => o.NFToken.NFTokenID)
          const FinalNFTokens = nodeWithNFTInfo[nodeAction].FinalFields.NFTokens.map(o => o.NFToken.NFTokenID)
          const differenceNFTokens = FinalNFTokens.filter(x => !PrevNFTokens.includes(x))
          console.log('NFTokens', i, tickets[i], { PrevNFTokens, FinalNFTokens, differenceNFTokens })
          NFTokenIDs = differenceNFTokens
        }
        messages.push(`NFTokenID: ${JSON.stringify(NFTokenIDs)}`)
        setCurrentMintMsg(messages.join('\n'))

        const offerTransactionBlob = {
          TransactionType: 'NFTokenCreateOffer',
          Account: wallet.classicAddress,
          NFTokenID: NFTokenIDs[0],
          Amount: details?.nftPrice?.toString() ?? '1000000',
          Flags: 1,
          Destination: process.env.NEXT_PUBLIC_XRP_BROKER_ADDRESS, // TODO: Insert Broker address (should be from env value)
        }

        messages.push(`TransactionType: ${offerTransactionBlob.TransactionType}`)
        setCurrentMintMsg(messages.join('\n'))
        const offerTx = await client.submitAndWait(offerTransactionBlob, { wallet: wallet })
        console.log('offerTx', offerTx)
        messages.push(`hash: ${offerTx.result.hash}`)
        messages.push(`\n\n`)

        CreatedNFTokenIDs.push(NFTokenIDs[0])
        setCurrentMintMsg(messages.join('\n'))
      }

      const insertedDbData = await fetch('/api/pledge', {
        method: 'POST',
        body: JSON.stringify({
          title: details?.title,
          description: details?.description,
          nftCount: details?.nftCount,
          nftPrice: details?.nftPrice, // prince in drops
          nftUri: window.xrpl.convertHexToString(details?.nftUri),
          tokens: CreatedNFTokenIDs,
          owner: wallet.classicAddress,
          identityUrl: details?.identityUrl,
        })
      }).then(resp => resp.json())
      console.log('Stored to DB', insertedDbData)

    } catch (error) {
      console.error('Mint and create sell offer', error)
    }

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
        {
          currentMintIndex === 0
            ? <Typography variant='body1'>
              Initializing connection and seed informations...
            </Typography>
            : <React.Fragment>
              <Typography variant='subtitle1'>
                NFT #{currentMintIndex}
              </Typography>
              <Box sx={{ maxHeight: 250, overflowY: 'auto' }}>
                <Typography variant='caption' sx={{ whiteSpace: 'pre-wrap' }}>
                  {currentMintMsg}
                </Typography>
              </Box>
            </React.Fragment>
        }
      </Grid>
    </Grid>

  const CompletedComponent = () =>
    <Grid container spacing={5}>
      <Grid item xs={12}>
        <Typography variant='body1'>
          All NFT is ready for supporters to pledge!
        </Typography>
        <Box sx={{ maxHeight: 250, overflowY: 'auto' }}>
          <Typography variant='caption' sx={{ whiteSpace: 'pre-wrap' }}>
            {currentMintMsg}
          </Typography>
        </Box>
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