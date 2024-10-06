import { Control, Controller } from 'react-hook-form'

import { InputLabel, Slider } from '@mui/material'

import { styles } from '../constants'
import { IAddEditTask } from '../types'

interface IProps {
  control: Control<IAddEditTask>
}

export const Progress = ({ control }: IProps) => {
  return (
    <Controller
      control={control}
      name='progress'
      render={({ field: { value, onChange } }) => (
        <>
          <InputLabel htmlFor='progress' sx={styles.mbMinus12}>
            Progress: <b>{Math.floor(value || 0)}</b>
          </InputLabel>
          <Slider
            id='progress'
            onChange={onChange}
            aria-label='Progress'
            value={value || 0}
            sx={styles.w224}
          />
        </>
      )}
    />
  )
}
