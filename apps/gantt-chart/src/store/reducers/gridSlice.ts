import { format } from 'date-fns'

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { mockData } from '../../__mock__/mockData'
import { ViewMode } from '../../types/types'
import { makeTask, Task, TaskInput } from '../../utils/Task'

interface IGridSlice {
  data: Task[]
  viewMode: ViewMode
}

const initialState: IGridSlice = {
  data: mockData.map((task) => makeTask(task)),
  viewMode: ViewMode.Month,
}

const toDate = (value: unknown): string => format(new Date(value as string), 'yyyy-MM-dd')

const gridSlice = createSlice({
  name: 'grid',
  initialState,
  reducers: {
    updateViewMode(state: IGridSlice, { payload }: PayloadAction<ViewMode>) {
      state.viewMode = payload
    },
    updateDate(
      state: IGridSlice,
      { payload: { id, start, end } }: PayloadAction<{ id: string; start: unknown; end: unknown }>,
    ) {
      const task = state.data.find((task) => task.id === id)
      if (task) {
        task.start = toDate(start)
        task.end = toDate(end)
      }
    },
    updateProgress(
      state: IGridSlice,
      { payload: { id, progress } }: PayloadAction<{ id: string; progress: number }>,
    ) {
      const task = state.data.find((task) => task.id === id)
      if (task) {
        task.progress = progress
      }
    },
    addTask(state: IGridSlice, { payload }: PayloadAction<TaskInput>) {
      state.data.push(makeTask(payload))
    },
    editTask(
      state: IGridSlice,
      { payload: { id, task } }: PayloadAction<{ id: string; task: TaskInput }>,
    ) {
      // Replace in place so the edited row keeps its position in the list.
      const index = state.data.findIndex((task) => task.id === id)
      if (index !== -1) {
        state.data[index] = makeTask({ ...task, id })
      }
    },
    deleteTask(state: IGridSlice, { payload }: PayloadAction<string>) {
      state.data = state.data.filter((task) => task.id !== payload)
    },
    resetGrid: () => initialState,
  },
})

const { reducer, actions } = gridSlice

export default reducer
export const {
  updateViewMode,
  updateDate,
  updateProgress,
  addTask,
  editTask,
  deleteTask,
  resetGrid,
} = actions
