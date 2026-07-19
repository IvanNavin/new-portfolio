import { useEffect, useState } from 'react'
import { Control, Controller } from 'react-hook-form'

import { InputLabel, MenuItem, Select } from '@mui/material'

import { useTypedSelector } from '../../../store/store'
import { styles } from '../constants'
import { IAddEditTask } from '../types'

interface IProps {
  control: Control<IAddEditTask>
}

export const Dependencies = ({ control }: IProps) => {
  // Value = task id (label = name): frappe-gantt links arrows by id, not name,
  // so storing names meant arrows never drew. Leading '' is the "None" option.
  const [options, setOptions] = useState<{ id: string; name: string }[]>([])

  const { data } = useTypedSelector((state) => state.gridReducer)

  useEffect(() => {
    if (data) {
      setOptions([{ id: '', name: '' }, ...data.map(({ id, name }) => ({ id, name }))])
    }
  }, [data])

  return (
    <Controller
      control={control}
      name='dependencies'
      render={({ field: { value, onChange } }) => (
        <>
          <InputLabel sx={styles.mbMinus12}>Dependency:</InputLabel>
          <Select
            size='small'
            value={typeof value === 'string' ? value : ''}
            onChange={onChange}
            sx={styles.w224}
          >
            {options.map(({ id, name }) => (
              <MenuItem key={id} value={id}>
                {name || 'None'}
              </MenuItem>
            ))}
          </Select>
        </>
      )}
    />
  )
}
