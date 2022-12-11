// ** React Imports// ** React Imports
import React, { useState } from 'react'
import type { MouseEvent } from 'react'
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

// ** Icons Imports
import ChevronUp from 'mdi-material-ui/ChevronUp'
import ChevronDown from 'mdi-material-ui/ChevronDown'
import ShareVariant from 'mdi-material-ui/ShareVariant'

// ** Custom Components Imports
import PledgeModal, { CardPledgeType } from '../modals/PledgeModal'

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
        <Link href={`/pledge/${props._id}`} passHref>
          <a>
            <Typography variant='h6' sx={{ marginBottom: 2 }}>
              {props.title}
            </Typography>
          </a>
        </Link>
        <Box sx={flexInBetween}>
          <Typography variant='subtitle1'>
            {'Available: ' + props.tokens.length + '/' + props.nftCount}
          </Typography>
          <Typography variant='subtitle1'>
            <strong>
              {window.xrpl.dropsToXrp(props.nftPrice) + ' XRP'}
            </strong>
          </Typography>
        </Box>
        <Typography variant='body2'>
          {props.description.substring(0, shortDescSize)}
        </Typography>
      </CardContent>
      <CardActions className='card-action-dense'>
        <Box sx={flexInBetween}>
          {
            props.tokens.length
              ? <Button onClick={handlePledge}>Pledge</Button>
              : <div />
          }
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
      <PledgeModal openState={pledgeModalState} onSuccess={async () => location.reload()} {...props} />
    </Card>
  )
}

export default CardPledge
