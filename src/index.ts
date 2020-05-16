import {
  createIotes,
  Strategy,
  TopologyMap,
  Selector,
  State,
  HostDispatchable,
  DeviceDispatchable,
  Dispatchable,
} from '@iotes/core'
import { useState } from 'react'

export type IotesReactHooks = {
  useIotesHost: (
    selector?: string[],
  ) => [any, (dispatchabe: HostDispatchable) => void]
  useIotesDevice: <Payload>(
    selector?: string[],
  ) => [any, (dispatchable: DeviceDispatchable<Payload>) => void]
}

export const createIotesReactHooks = (
  topology: TopologyMap<any, any>,
  strategy: Strategy<any, any>,
): IotesReactHooks => {
  const iotes = createIotes({ topology, strategy })

  const {
    hostDispatch, deviceDispatch, hostSubscribe, deviceSubscribe,
  } = iotes

  const createHook = (
    subscribe: any,
    dispatch: (state: State) => void,
    selector?: Selector,
  ): [any, (
      dispatchable: Dispatchable
    ) => void] => {
    const [state, setState] = useState({})

    subscribe((s: { [key: string]: unknown }) => setState(s), null)

    return [state, dispatch]
  }

  const useIotesDevice = (selector: string[]) => (
    createHook(deviceSubscribe, deviceDispatch, selector)
  )

  const useIotesHost = (selector: string[]) => (
    createHook(hostSubscribe, hostDispatch, selector)
  )

  return {
    useIotesDevice,
    useIotesHost,
  }
}
