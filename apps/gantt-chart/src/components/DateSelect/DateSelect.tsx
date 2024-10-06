import { MenuItem, Select, SelectChangeEvent } from '@mui/material'

import { useTypedSelector } from '../../store/store'
import { ViewMode } from '../../types/types'
import { useActions } from '../../utils/useActions'

import s from './DateSelect.module.sass'

const options: ViewMode[] = [ViewMode.Day, ViewMode.Month]

export const DateSelect = () => {
  const { updateViewMode } = useActions()
  const { viewMode } = useTypedSelector((state) => state.gridReducer)

  const onChange = ({ target: { value } }: SelectChangeEvent<ViewMode>) => {
    value && updateViewMode(value as ViewMode)
  }

  return (
    <div className={s.wrapper}>
      <Select size='small' value={viewMode} onChange={onChange}>
        {options.map((item) => (
          <MenuItem key={item} value={item}>
            {item}
          </MenuItem>
        ))}
      </Select>
    </div>
  )
}
