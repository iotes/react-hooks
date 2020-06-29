import React, { FC, useState, useEffect } from 'react'
import { create, act } from 'react-test-renderer'

import {
  createDeviceDispatchable,
  Store,
  Strategy,
} from '@iotes/core'

import {
  StrategyConfig,
  DeviceTypes,
  createTestStrategy,
  config,
  wait,
} from '@iotes/strategy-test'

import { createIotes, IotesReactHooks } from '../src/index'

// MODULE
let remote: Store
let strategy: Strategy<StrategyConfig, DeviceTypes>
let iotesReactHooks: IotesReactHooks

const el = React.createElement
let testRoot: any
let TestComponent: FC
let currentDeviceVal: {[key: string]: any} = {}

const oe = console.error

describe('React Hooks ', () => {
  // SET UP
  beforeEach(() => {
    [remote, strategy] = createTestStrategy()
    iotesReactHooks = createIotes({
      topology: config.topology,
      strategy,
    })

    TestComponent = () => {
      const [isSent, setIsSent] = useState(false)
      const [deviceVal, setDeviceVal] = iotesReactHooks.useIotesDevice()
      const [hostVal, setHostVal] = iotesReactHooks.useIotesHost()

      useEffect(() => {
        currentDeviceVal = deviceVal
      }, [deviceVal])

      return el(React.Fragment, null, [
        el('div', { key: 0 }, `${JSON.stringify(hostVal)}`),
        el('div', { key: 1 }, `${JSON.stringify(deviceVal)}`),
      ])
    }

    act(() => {
      testRoot = create(el(TestComponent, null, null))
    })
  })

  afterEach(() => {
    iotesReactHooks = null

    console.error = oe
  })

  // Tests
  test('Can intergrate with react hooks and receive host updates ', async () => {
    expect(testRoot.toJSON()).not.toBe(null)

    const { hosts } = config.topology

    // Surpress console errors to stop act errors logging as state
    // update within iotes cannot use act method from test tenderer
    console.error = jest.fn()

    const newComponent: any = await new Promise((res) => {
      setTimeout(() => res(testRoot.toJSON()), 20)
    })

    const newEventFromHook = JSON.parse(newComponent[0].children)

    expect(newEventFromHook[hosts[0].name].type).toBe('CONNECT')
  })

  test('Can intergrate with react hooks and receive device updates ', async () => {
    expect(testRoot.toJSON()).not.toBe(null)

    // Surpress console errors to stop act errors logging as
    // state update within iotes cannot use act method from test renderer
    console.error = jest.fn()

    remote.dispatch(createDeviceDispatchable('DEVICE_ONE', 'UPDATE', { signal: 'test' }))
    remote.dispatch(createDeviceDispatchable('DEVICE_TWO', 'UPDATE', { signal: 'test' }))

    await wait()
    // const newEventFromHook = JSON.parse(newComponent[1].children)

    // Dynamically adjust to given test topology
    expect(Object.keys(currentDeviceVal).length).toEqual(2)
  })

  test('Can dispatch with react hooks and receive device updates ', async () => {
    expect(testRoot.toJSON()).not.toBe(null)

    // Surpress console errors to stop act errors logging as state update
    // within iotes cannot use act method from test tenderer
    console.error = jest.fn()

    remote.dispatch(createDeviceDispatchable('DEVICE_ONE', 'UPDATE', { signal: 'test' }))
    remote.dispatch(createDeviceDispatchable('DEVICE_TWO', 'UPDATE', { signal: 'test' }))

    await wait()

    expect(currentDeviceVal).toHaveProperty('DEVICE_ONE')
    expect(currentDeviceVal.DEVICE_ONE.payload).toStrictEqual({ signal: 'test' })
  })
})
