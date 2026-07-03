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

// Deterministic color per task so the dot stays the same across re-renders
// (Math.random() in render re-rolled it every time and flickered).
const stringToColor = (value: string): string => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash)
  }

  // Spread the hue so near-identical labels ("Task 1"/"Task 2") get distinct
  // colors instead of neighbouring shades.
  const hue = (Math.abs(hash) * 137) % 360

  return `hsl(${hue}, 65%, 55%)`
}

export const Task = ({ task }: IProps) => {
  const [visible, setVisible] = useState(false)

  const color = stringToColor(task.id || task.name || '')

  const onEdit = () => {
    setVisible(true)
  }

  const onClose = () => {
    setVisible(false)
  }

  return (
    <div className={s.Task}>
      <span className={s.circle} style={{ background: color }} />
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
