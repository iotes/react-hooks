import {
  createIotes as createIotesCore,
  Strategy,
  TopologyMap,
  Selector,
  State,
  HostDispatchable,
  DeviceDispatchable,
  Dispatchable,
  Iotes,
  LogLevel,
  Logger,
  IotesHooks,
} from '@iotes/core'

import { useState, useEffect, useRef } from 'react'

type ReactHooksArgs<StrategyConfig, DeviceTypes extends string> = {
  topology: TopologyMap<StrategyConfig, DeviceTypes>;
  strategy: Strategy<StrategyConfig, DeviceTypes>;
  plugin?: (iotes: Iotes) => any;
  logLevel?: LogLevel;
  logger?: Logger;
  lifecycleHooks?: IotesHooks;
}

// TYPES

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

type CreateIotesReactHooks = <StrategyConfig, DeviceTypes extends string>(
  args:ReactHooksArgs<StrategyConfig, DeviceTypes>
) => IotesReactHooks


// CREATE

export const createIotes: CreateIotesReactHooks = ({
  topology,
  strategy,
}): IotesReactHooks => {
  const iotes = createIotesCore({ topology, strategy })

  const {
    hostDispatch, deviceDispatch, hostSubscribe, deviceSubscribe,
  } = iotes

  const createHook = (
    subscribe: any,
    dispatch: (state: State) => void,
    selector?: Selector,
  ): [State, (
      dispatchable: Dispatchable
    ) => void
  ] => {
    const isHookSubscribed = useRef(false)
    const [state, setState] = useState({})

    useEffect(() => {
      if (isHookSubscribed.current === false) {
        subscribe((iotesState: State) => { setState(iotesState) }, selector)
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
