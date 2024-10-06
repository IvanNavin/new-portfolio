export interface IAddEditTask {
  name: string
  date: [Date | null, Date | null]
  progress: number
  dependencies: string | string[]
}
