// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Icons Imports

// ** Custom Components Imports

// ** Styled Component Import

// ** Demo Components Imports
import CardPledge from 'src/views/cards/CardPledge'

const PledgeList = [
  {
    image: '/images/cards/paper-boat.png',
    title: 'Popular Uses Of The Internet',
    short: 'Although cards can support multiple actions, UI controls, and an overflow menu.',
    details: `I'm a thing. But, like most politicians, he promised more than he could deliver. You won't have
    time for sleeping, soldier, not with all the bed making you'll be doing. Then we'll go with that
    data file! Hey, you add a one and two zeros to that or we walk! You're going to do his laundry?
    I've got to find a way to escape.`
  }
]

const Dashboard = () => {
  return (
    <Grid container spacing={6}>
      {
        PledgeList.map((params, i) =>
          <Grid item xs={12} sm={6} md={4}>
            <CardPledge key={`x${i}`} {...params} />
          </Grid>
        )
      }
    </Grid>
  )
}

export default Dashboard
