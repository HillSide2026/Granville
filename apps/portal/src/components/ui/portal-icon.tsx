import type { ComponentPropsWithoutRef } from 'react'
import { Icon } from './icon'
import type { IconName } from './icon-registry'

export function createPortalIcon(name: IconName) {
  return function PortalIcon(props: ComponentPropsWithoutRef<'span'>) {
    return <Icon name={name} {...props} />
  }
}
