import { Control, Controller } from 'react-hook-form'

import { InputLabel, TextField } from '@mui/material'

import { styles } from '../constants'
import { IAddEditTask } from '../types'

interface IProps {
  control: Control<IAddEditTask>
}

export const TaskName = ({ control }: IProps) => {
  return (
    <Controller
      control={control}
      name='name'
      render={({ field: { value, onChange } }) => (
        <>
          <InputLabel sx={styles.mbMinus12}>Task Name:</InputLabel>
          <TextField
            onChange={onChange}
            id='outlined-basic'
            variant='outlined'
            sx={styles.w224}
            value={value || ''}
            size='small'
          />
        </>
      )}
    />
  )
}
