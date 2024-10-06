import { Button } from '@mui/material'

import { Task } from '../../utils/Task'

import { styles } from './constants'
import { DateRange } from './DateRange'
import { Dependencies } from './Dependencies'
import { Progress } from './Progress'
import { TaskName } from './TaskName'
import { useAddEditTask } from './useAddEditTask'

import 'react-datepicker/dist/react-datepicker.css'

import s from './AddEditTask.module.sass'

interface IProps {
  onClose: () => void
  task?: Partial<Task> | null
}

export const AddEditTask = ({ onClose, task = null }: IProps) => {
  const { control, onSubmit, onDelete, readyToSubmit } = useAddEditTask(task, onClose)

  return (
    <form onSubmit={onSubmit} className={s.AddEditTask}>
      <TaskName control={control} />
      <DateRange control={control} />
      {task && <Progress control={control} />}
      <Dependencies control={control} />
      <Button
        type='submit'
        variant='outlined'
        sx={{ ...styles.h40, ...styles.w224 }}
        disabled={!readyToSubmit}
        size='small'
      >
        {task ? 'Save' : 'Submit'}
      </Button>
      {task && (
        <Button
          onClick={onDelete}
          variant='outlined'
          color='error'
          sx={{ ...styles.h40, ...styles.w224 }}
          size='small'
        >
          Delete
        </Button>
      )}
    </form>
  )
}
