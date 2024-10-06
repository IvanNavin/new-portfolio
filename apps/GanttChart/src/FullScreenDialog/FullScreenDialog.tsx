import { forwardRef, ReactElement, ReactNode, Ref } from 'react'

import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import AppBar from '@mui/material/AppBar'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Slide from '@mui/material/Slide'
import Toolbar from '@mui/material/Toolbar'
import { TransitionProps } from '@mui/material/transitions'
import Typography from '@mui/material/Typography'

import s from './FullScreenDialog.module.sass'

const styles = {
  AppBar: { position: 'relative', background: '#877CFF' },
  typography: { ml: 2, flex: 1 },
  IconButton: {
    '& path': {
      fill: '#fff',
    },
  },
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement
  },
  ref: Ref<unknown>,
) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface IProps {
  open: boolean
  onClose: () => void
  children: ReactNode | ReactElement | ReactElement[]
  title: string
}

export function FullScreenDialog({ open, onClose, children, title }: IProps) {
  return (
    <Dialog fullScreen open={open} onClose={onClose} TransitionComponent={Transition}>
      <AppBar sx={styles.AppBar}>
        <Toolbar>
          <Typography sx={styles.typography} variant='h6' component='div'>
            {title}
          </Typography>
          <IconButton
            edge='end'
            color='inherit'
            onClick={onClose}
            aria-label='close'
            sx={styles.IconButton}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <div className={s.content}>{children}</div>
    </Dialog>
  )
}
