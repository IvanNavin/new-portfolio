import { useState } from 'react'

import AddIcon from '@mui/icons-material/Add'
import { Fab, SxProps } from '@mui/material'

import { FullScreenDialog } from '../../FullScreenDialog/FullScreenDialog'
import { AddEditTask } from '../AddEditTask'

const styles = {
  fabStyle: {
    position: 'absolute',
    bottom: 52,
    right: 36,
  },
}

export const AddButton = () => {
  const [visible, setVisible] = useState(false)

  const onFab = () => setVisible(true)
  const onClose = () => setVisible(false)

  return (
    <>
      <Fab color='primary' aria-label='add' sx={styles.fabStyle as SxProps} onClick={onFab}>
        <AddIcon />
      </Fab>
      <FullScreenDialog open={visible} onClose={onClose} title='Add Task'>
        <AddEditTask onClose={onClose} />
      </FullScreenDialog>
    </>
  )
}
