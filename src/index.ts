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
  Middleware,
  Subscription,
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
  callback?: (iotesState: State) => State,
  selector?: string[],
  middleware?: Middleware[],
) => [State, (dispatchabe: HostDispatchable) => void]

type UseIotesDevice = <Payload>(
  callback?: (iotesState: State) => State,
  selector?: string[],
  middleware?: Middleware[],
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
    subscribe: typeof deviceSubscribe,
    dispatch: (state: State) => void,
    selector?: Selector,
    middleware: Middleware[] = [],
    callback: (iotesState: State) => State = (state) => state,
  ): [State, (
      dispatchable: Dispatchable
    ) => void
  ] => {
    const isHookSubscribed = useRef(false)
    const [state, setState] = useState({})

    useEffect(() => {
      if (isHookSubscribed.current === false) {
        subscribe((iotesState: State) => { setState(callback(iotesState)) }, selector, middleware)
        isHookSubscribed.current = true
      }
    }, [isHookSubscribed.current, state])

    return [state, dispatch]
  }

  const useIotesDevice = (
    callback?: (state: State) => State,
    selector?: string[],
    middleware?: Middleware[],
  ) => (
    createHook(deviceSubscribe, deviceDispatch, selector, middleware, callback)
  )

  const useIotesHost = (
    callback?: (state: State) => State,
    selector?: string[],
    middleware?: Middleware[],
  ) => (
    createHook(hostSubscribe, hostDispatch, selector, middleware, callback)
  )

  return {
    useIotesDevice,
    useIotesHost,
  }
}
