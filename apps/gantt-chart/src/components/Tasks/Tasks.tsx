import { shallowEqual } from 'react-redux'

import { useTypedSelector } from '../../store/store'
import { DateSelect } from '../DateSelect'

import { Task } from './Task'

import s from './Tasks.module.sass'

export const Tasks = () => {
  const { data } = useTypedSelector((state) => state.gridReducer, shallowEqual)

  return (
    <div className={s.Tasks}>
      <DateSelect />
      {data.map((task) => (
        <Task task={task} key={task.name} />
      ))}
    </div>
  )
}
