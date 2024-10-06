import DatePicker from 'react-datepicker'
import { Control, Controller } from 'react-hook-form'

import { InputBase, InputLabel } from '@mui/material'

import { styles } from '../constants'
import { IAddEditTask } from '../types'

interface IProps {
  control: Control<IAddEditTask>
}

const getValue = (dates: (Date | null) | [Date | null, Date | null], type: string) => {
  if (Array.isArray(dates)) {
    const [start, end] = dates

    return type === 'start' ? start : end
  }

  return null
}

export const DateRange = ({ control }: IProps) => {
  return (
    <Controller
      control={control}
      name='date'
      render={({ field: { value, onChange } }) => (
        <>
          <InputLabel sx={styles.mbMinus12}>Date range:</InputLabel>
          <DatePicker
            id='date'
            startDate={getValue(value, 'start')}
            endDate={getValue(value, 'end')}
            placeholderText='Select date range'
            customInput={<InputBase sx={{ ...styles.w224, ...styles.input }} />}
            onChange={onChange}
            autoComplete='off'
            monthsShown={2}
            selectsRange
            withPortal
          />
        </>
      )}
    />
  )
}
