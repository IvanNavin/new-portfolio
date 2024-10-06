import { CSSProperties, useState } from 'react'

import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { IconButton } from '@mui/material'

import { FullScreenDialog } from '../../FullScreenDialog/FullScreenDialog'
import { Task as CTask } from '../../utils/Task'
import { AddEditTask } from '../AddEditTask'

import s from './Tasks.module.sass'

interface IProps {
  task: Partial<CTask>
}

const styles: { [key: string]: CSSProperties } = {
  edit: {
    position: 'absolute',
    right: '5px',
  },
}

export const Task = ({ task }: IProps) => {
  const [visible, setVisible] = useState(false)

  const randomColor = `#${Math.random().toString(16).substring(2, 8)}`
  styles['bg'] = { background: randomColor }

  const onEdit = () => {
    setVisible(true)
  }

  const onClose = () => {
    setVisible(false)
  }

  return (
    <div className={s.Task}>
      <span className={s.circle} style={styles.bg} />
      <span>{task.name}</span>
      <IconButton aria-label='edit' size='small' sx={styles.edit} onClick={onEdit}>
        <EditOutlinedIcon />
      </IconButton>
      <FullScreenDialog open={visible} onClose={onClose} title='Edit Task'>
        <AddEditTask onClose={onClose} task={task} />
      </FullScreenDialog>
    </div>
  )
}
