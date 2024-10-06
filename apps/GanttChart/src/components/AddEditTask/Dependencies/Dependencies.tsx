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
  const [tasksList, setTasksList] = useState<(string | undefined)[]>([])

  const { data } = useTypedSelector((state) => state.gridReducer)

  useEffect(() => {
    if (data) {
      const arr = data.map(({ name }) => name).filter(Boolean)
      arr.unshift('')
      setTasksList(arr)
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
            value={value && !tasksList?.length ? '' : value || ''}
            onChange={onChange}
            sx={styles.w224}
          >
            {tasksList.map((name) => (
              <MenuItem key={name} value={name}>
                {name ? name : 'None'}
              </MenuItem>
            ))}
          </Select>
        </>
      )}
    />
  )
}
