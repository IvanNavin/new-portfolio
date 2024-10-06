import { TypedUseSelectorHook, useSelector } from 'react-redux'

import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

import gridReducer from './reducers/gridSlice'

const reducers = {
  gridReducer,
}

const rootReducer = combineReducers(reducers)

const setupStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })

export const store = setupStore()

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector
