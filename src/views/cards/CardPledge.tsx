// ** React Imports// ** React Imports
import { useState } from 'react'
import type { MouseEvent, Dispatch, SetStateAction } from 'react'

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

// ** Icons Imports
import ChevronUp from 'mdi-material-ui/ChevronUp'
import ChevronDown from 'mdi-material-ui/ChevronDown'
import ShareVariant from 'mdi-material-ui/ShareVariant'

interface CardPledgeType {
  title: string
  short: string
  details: string
  image: string
}

interface PledgeModalType {
  openState: [boolean, Dispatch<SetStateAction<boolean>>]
}

const PledgeModal = ({ openState }: PledgeModalType) => {
  const [open, setOpen] = openState

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
      }}>
        <CardHeader title='Pledge an amount' titleTypographyProps={{ variant: 'h6' }} />
        <CardContent>
        </CardContent>
      </Box>
    </Modal>
  )
}

const CardPledge = (props: CardPledgeType) => {
  // ** State
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

  return (
    <Card>
      <CardMedia sx={{ height: '14.5625rem' }} image={props.image} />
      <CardContent>
        <Typography variant='h6' sx={{ marginBottom: 2 }}>
          {props.title}
        </Typography>
        <Typography variant='body2'>
          {props.short}
        </Typography>
      </CardContent>
      <CardActions className='card-action-dense'>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
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
            <IconButton size='small' onClick={handleCollapse}>
              {collapse ? <ChevronUp sx={{ fontSize: '1.875rem' }} /> : <ChevronDown sx={{ fontSize: '1.875rem' }} />}
            </IconButton>
          </div>
        </Box>
      </CardActions>
      <Collapse in={collapse}>
        <Divider sx={{ margin: 0 }} />
        <CardContent>
          <Typography variant='body2'>
            {props.details}
          </Typography>
        </CardContent>
      </Collapse>
      <PledgeModal openState={pledgeModalState} />
    </Card>
  )
}

export default CardPledge
