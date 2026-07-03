// Plain, serializable task shape. Redux state must stay serializable and be
// safe for Immer to draft — class instances (with private fields / accessors)
// are neither, so tasks are plain objects created via `makeTask`.
export interface Task {
  id: string
  name: string
  start: string
  end: string
  progress: number
  dependencies: string[]
  custom_class?: string
}

const DEFAULT_PROGRESS = 0.52

const toDependencies = (value?: string | string[]): string[] => {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((dependency) => dependency.trim())
      .filter(Boolean)
  }

  return []
}

export type TaskInput = Partial<Omit<Task, 'dependencies'>> & {
  dependencies?: string | string[]
}

export const makeTask = ({
  id = '',
  name = '',
  start = '',
  end = '',
  progress,
  dependencies,
  custom_class,
}: TaskInput = {}): Task => ({
  id,
  name,
  start,
  end,
  progress: progress || DEFAULT_PROGRESS,
  dependencies: toDependencies(dependencies),
  ...(custom_class ? { custom_class } : {}),
})
