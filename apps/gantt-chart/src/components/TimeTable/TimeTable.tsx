import { FrappeGantt } from 'frappe-gantt-react'
import { Task } from 'frappe-gantt-react/typings/Task'
import { useEffect } from 'react'

import { useTypedSelector } from '../../store/store'
import { ViewMode } from '../../types/types'
import { useActions } from '../../utils/useActions'

import s from './TimeTable.module.sass'

const makeToday = (str: string) => {
  const arr = str.split(' ')
  const halfCell = 18
  const topOffset = 80
  let x = 0

  for (let i = 0; i < arr.length; i++) {
    if (arr[i].startsWith('x=')) {
      arr[i] = arr[i].substring(0, arr[i].length - 1)
      arr[i] = arr[i].substring(3, arr[i].length)
      x = +arr[i] + halfCell
      arr[i] = `x="${Number(arr[i]) + halfCell}"`
    } else if (arr[i].startsWith('y=')) {
      arr[i] = `y="${topOffset}"`
    } else if (arr[i].startsWith('height=')) {
      arr[i] = arr[i].substring(0, arr[i].length - 1)
      arr[i] = arr[i].substring(8, arr[i].length)
      arr[i] = `height="${Number(arr[i]) - topOffset}"`
    } else if (arr[i].startsWith('class=')) {
      arr[i] = 'fill="black"'
    } else if (arr[i].startsWith('width')) {
      arr[i] = `width="2"`
    }
  }

  const date = new Date().toLocaleDateString('en-US')
  const text = `<text x="${x - 24}" y="${topOffset - 5}" fill="black" >${date}</text>`

  // Tagged group so a prior marker can be found + removed before re-inserting.
  return `<g class="today-line-marker">${text}${arr.join(' ')}></rect></g>`
}

export const TimeTable = () => {
  const { data, viewMode } = useTypedSelector((state) => state.gridReducer)
  const { updateDate, updateProgress } = useActions()

  const onDateChange = (task: Task, start: unknown, end: unknown) => {
    updateDate({ id: task.id, start, end })
  }

  const onProgressChange = (task: Task, progress: number) => {
    updateProgress({ id: task.id, progress })
  }

  useEffect(() => {
    if (viewMode !== ViewMode.Day) return

    // Re-run on `data` too: FrappeGantt rebuilds its SVG on task changes, wiping
    // the marker — without this the today line vanished until a view toggle.
    const timer = setTimeout(() => {
      const todayColumn = document.querySelector('.today-highlight')
      const gantt = document.querySelector('.gantt')

      if (gantt && todayColumn) {
        // Drop any stale marker first so toggling views can't stack duplicates.
        gantt.querySelector('.today-line-marker')?.remove()
        gantt.insertAdjacentHTML('beforeend', makeToday(todayColumn.outerHTML))
      }
    })

    return () => clearTimeout(timer)
  }, [viewMode, data])

  return (
    <div className={s.wrapper}>
      {data && (
        <FrappeGantt
          tasks={data as unknown as Task[]}
          viewMode={viewMode}
          onDateChange={onDateChange}
          onProgressChange={onProgressChange}
          // onClick={(task) => console.log(task)}
          // onTasksChange={onTasksChange}
        />
      )}
    </div>
  )
}
