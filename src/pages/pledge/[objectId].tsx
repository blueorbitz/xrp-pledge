import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// ** Icons Imports

// ** Custom Components Imports
import PledgeModal from 'src/views/modals/PledgeModal'
import useXrplNetwork from 'src/@core/hooks/useXrplNetwork'

const PledgePage = () => {
  const pledgeModalState = useState<boolean>(false)
  const [pledge, setPledge] = useState<any>(null)
  const router = useRouter();
  const { getXrplExplorer } = useXrplNetwork()

  const handlePledge = () => {
    pledgeModalState[1](true)
  }

  const loadPage = async () => {
    const { objectId } = router.query;
    const response = await fetch('/api/pledge?' + new URLSearchParams({
      _id: objectId as string,
    }))
    const data = await response.json()
    if (data.length)
      setPledge(data[0])
  }

  useEffect(() => {
    if (!router.isReady)
      return
    loadPage()
  }, [router.isReady])

  interface KeyValLayoutType {
    title: string
    description: string
  }
  const KeyValLayout = (props: KeyValLayoutType) =>
    <Box sx={{ marginRight: 2, display: 'flex', flexDirection: 'column' }}>
      <Typography variant='subtitle2' sx={{ fontWeight: 800 }}>{props.title}</Typography>
      <Typography variant='caption'>{props.description}</Typography>
    </Box>

  const PledgeSingleContent = () => <React.Fragment>
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant='h4'>
        {pledge.title} - <small>({pledge.network})</small>
      </Typography>
      {
        pledge.tokens.length
          ? <Button onClick={handlePledge}>Pledge</Button>
          : null
      }
    </Box>
    <br />
    <CardMedia sx={{ height: '14.5625rem' }} image={pledge.nftUri} />
    <br />
    <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
      {pledge.description}
    </Typography>
    <br />
    <KeyValLayout title='NFT Issuer' description={pledge.owner} />
    {
      pledge.identityUrl !== '' &&
      <KeyValLayout title='Verify link' description={pledge.identityUrl} />
    }
    <KeyValLayout title='Total Minted NFT' description={pledge.nftCount} />
    <KeyValLayout title='Total Available NFT' description={pledge.tokens.length} />
    <KeyValLayout title='Min Price per NFT' description={`${window.xrpl.dropsToXrp(pledge.nftPrice)} XRP`} />
    <br />
    <Typography variant='subtitle1'>
      Available Tokens
    </Typography>
    <ul>
      {
        pledge.tokens.map(NFTokenID => <li key={NFTokenID}>
          <Link href={`${getXrplExplorer(pledge.network)}/nft/${NFTokenID}`} passHref>
            <a>
              <Typography variant='caption'>{NFTokenID}</Typography>
            </a>
          </Link>
        </li>)
      }
    </ul>
    <Typography variant='subtitle1'>
      Sold Tokens
    </Typography>
    <ul>
      {
        pledge.sales.map((buyer, i) => <li key={`buyer-${i}`}>
          <Box sx={{ marginRight: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>{buyer.buyer as string}</Typography>
            <Link href={`${getXrplExplorer(pledge.network)}/nft/${buyer.tokenId}`} passHref>
              <a>
                <Typography variant='caption'>{buyer.tokenId}</Typography>
              </a>
            </Link>
          </Box>
        </li>)
      }
    </ul>
  </React.Fragment>

  return (
    <React.Fragment>
      <Grid container spacing={6}>
        <Grid item md={12}>
          <Card>
            <CardContent>
              {
                pledge !== null
                  ? <PledgeSingleContent />
                  : <Typography variant='subtitle2'>object id not found!</Typography>
              }
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <PledgeModal openState={pledgeModalState} onSuccess={loadPage} {...pledge} />
    </React.Fragment>
  )
}

export default PledgePage
