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

// ** Icons Imports
import MessageOutline from 'mdi-material-ui/MessageOutline'
import PanoramaOutline from 'mdi-material-ui/PanoramaOutline'
import CreditCardOutline from 'mdi-material-ui/CreditCardOutline'

const CreatePledgeAction = () => {
  const [open, setOpen] = useState(false)

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
  }

  // ** States 
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  return (
    <React.Fragment>
      <Button variant='contained' onClick={handleOpen} sx={{ mr: 5 }}>Create Pledge</Button>
      <Modal
        open={open}
        onClose={handleClose}
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
          <CardHeader title='Create a New Pledge' titleTypographyProps={{ variant: 'h6' }} />
          <CardContent>
            <form onSubmit={onSubmit}>
              <Grid container spacing={5}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Title'
                    placeholder='What is this for?'
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type='file'
                    label='Image'
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
                    <Button type='submit' variant='contained' size='large'>
                      Create
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Box>
      </Modal>
    </React.Fragment>
  )
}

export default CreatePledgeAction