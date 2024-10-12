import { format } from 'date-fns'
import { useEffect } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup/dist/yup'

import { Task } from '../../utils/Task'
import { useActions } from '../../utils/useActions'

import { IAddEditTask } from './types'

const schema = yup.object().shape({
  name: yup.string().trim().required('required string min 2').min(2),
  date: yup.array().of(yup.date().required('required date')).defined().nullable(),
})

export const useAddEditTask = (task: Partial<Task> | null, onClose: () => void) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isValid },
  } = useForm<IAddEditTask>({
    mode: 'onChange',
    resolver: yupResolver(schema),
  })
  const { addTask, editTask, deleteTask } = useActions()

  const onSubmit: SubmitHandler<IAddEditTask> = ({
    name,
    date: [start, end],
    progress,
    dependencies,
  }) => {
    if (task?.name) {
      editTask({
        taskName: task.name,
        task: {
          id: name,
          name,
          start: format(start as Date, 'yyyy-MM-dd'),
          end: format(end as Date, 'yyyy-MM-dd'),
          progress,
          dependencies,
        },
      })
    } else {
      addTask({
        id: name,
        name,
        start: format(start as Date, 'yyyy-MM-dd'),
        end: format(end as Date, 'yyyy-MM-dd'),
        progress: 0,
        dependencies,
      })
    }
    onClose()
  }

  const onDelete = () => task?.name && deleteTask(task.name)

  useEffect(() => {
    if (task) {
      reset({
        name: task.name || '',
        date: [new Date(task.start as string) || null, new Date(task.end as string) || null],
        progress: task.progress || 0,
        dependencies: task.dependencies || '',
      })
    }
  }, [task, reset])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => reset(), [])

  return {
    control,
    onSubmit: handleSubmit(onSubmit),
    onDelete,
    readyToSubmit: isDirty && isValid,
  }
}
