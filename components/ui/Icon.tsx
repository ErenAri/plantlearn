import { Feather } from '@expo/vector-icons'
import type { ComponentProps } from 'react'

export type IconName = ComponentProps<typeof Feather>['name']

interface IconProps extends Omit<ComponentProps<typeof Feather>, 'name'> {
  name: IconName
}

export function Icon({ name, ...rest }: IconProps) {
  return <Feather name={name} {...rest} />
}
