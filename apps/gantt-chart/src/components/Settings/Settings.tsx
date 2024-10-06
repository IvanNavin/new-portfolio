import { ReactElement, ReactNode } from 'react'

import s from './Settings.module.sass'

interface IProps {
  children: ReactNode | ReactElement | ReactElement[]
}

export const Settings = ({ children }: IProps) => {
  return <div className={s.Settings}>{children}</div>
}
