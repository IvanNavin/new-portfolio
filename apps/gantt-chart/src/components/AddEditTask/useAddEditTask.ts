import { format } from 'date-fns'
import { useEffect } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import * as yup from 'yup'

import { yupResolver } from '@hookform/resolvers/yup/dist/yup'

import { Task } from '../../utils/Task'
import { useActions } from '../../utils/useActions'

import { IAddEditTask } from './types'

const schema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  date: yup.array().of(yup.date().required('Pick a date')).defined().nullable(),
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
    const fields = {
      name,
      start: format(start as Date, 'yyyy-MM-dd'),
      end: format(end as Date, 'yyyy-MM-dd'),
      dependencies,
    }

    if (task?.id) {
      // Keep the existing id so drag/progress edits keep referencing this task.
      editTask({ id: task.id, task: { ...fields, progress } })
    } else {
      addTask({ id: crypto.randomUUID(), progress: 0, ...fields })
    }
    onClose()
  }

  const onDelete = () => task?.id && deleteTask(task.id)

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
