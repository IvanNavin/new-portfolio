import React from 'react'
import { Provider } from 'react-redux'

import { AddButton } from './components/AddButton'
import { Grid } from './components/Grid'
import { Tasks } from './components/Tasks'
import { TimeTable } from './components/TimeTable'
import { store } from './store/store'

import './App.css'

function App() {
  return (
    <Provider store={store}>
      <div className='App'>
        <Grid>
          <Tasks />
          <TimeTable />
          <AddButton />
        </Grid>
      </div>
    </Provider>
  )
}

export default App
