import { useDispatch } from 'react-redux'

import { bindActionCreators } from '@reduxjs/toolkit'

import {
  addTask,
  deleteTask,
  editTask,
  resetGrid,
  updateDate,
  updateProgress,
  updateViewMode,
} from '../store/reducers/gridSlice'
import { AppDispatch } from '../store/store'

const actions = {
  updateViewMode,
  updateDate,
  updateProgress,
  addTask,
  editTask,
  deleteTask,
  resetGrid,
}

export const useActions = () => {
  const dispatch = useDispatch<AppDispatch>()
  return bindActionCreators(actions, dispatch)
}
