import {
  createIotes as createIotesCore,
  Strategy,
  TopologyMap,
  Selector,
  State,
  HostDispatchable,
  DeviceDispatchable,
  Dispatchable,
} from '@iotes/core'
import { useState, useEffect, useRef } from 'react'

type UseIotesHost = (
  selector?: string[],
) => [State, (dispatchabe: HostDispatchable) => void]

type UseIotesDevice = <Payload>(
  selector?: string[],
) => [State, (dispatchable: DeviceDispatchable<Payload>) => void]

export type IotesReactHooks = {
  useIotesHost: UseIotesHost,
  useIotesDevice: UseIotesDevice,
}

export const createIotes = (
  topology: TopologyMap<any, any>,
  strategy: Strategy<any, any>,
): IotesReactHooks => {
  const iotes = createIotesCore({ topology, strategy })

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
    const isHookSubscribed = useRef(false)
    const [state, setState] = useState({})

    useEffect(() => {
      if (isHookSubscribed.current === false) {
        subscribe((iotesState: State) => {
          setState(iotesState)
        }, selector)
        isHookSubscribed.current = true
      }
    }, [isHookSubscribed.current, state])

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
