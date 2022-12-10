import { useState, useEffect } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

// ** Icons Imports

// ** Custom Components Imports
import useXrplNetwork from 'src/@core/hooks/useXrplNetwork'
import CardPledge from 'src/views/cards/CardPledge'

const Dashboard = () => {
  const [pledges, setPledges] = useState<any[]>([])
  const { network } = useXrplNetwork()

  useEffect(() => {
    (async () => {
      const data = await fetch('/api/pledge?' + new URLSearchParams({
        network,
      }))
      setPledges(await data.json())
    })();
  }, [network])

  return (
    <Grid container spacing={6}>
      {
        pledges.length === 0 &&
        <Grid item>
          <Typography variant='subtitle1'>
            No pledge has been created on this network
          </Typography>
        </Grid>
      }
      {
        pledges.map(params =>
          <Grid item xs={12} sm={6} md={4}>
            <CardPledge key={`pledge-${params._id}`} {...params} />
          </Grid>
        )
      }
    </Grid>
  )
}

export default Dashboard
