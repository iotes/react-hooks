/*

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

import {
  phidgetStrategy,
} from '@iotes/strategy-phidget'

import { createIotes, IotesReactHooks } from '../src/index'

const topology = {
  client: {
    name: 'test',
  },
  hosts: [{ name: 'testapp/0', host: '127.0.0.1', port: '5661' }],
  devices: [
    {
      hostName: 'testapp/0',
      type: 'ROTARY_ENCODER',
      name: 'ENCODER/1',
      channel: 2,
    },
  ],
}

// MODULE
let remote: Store
let strategy: Strategy<StrategyConfig, DeviceTypes>
let iotesReactHooks: IotesReactHooks

const el = React.createElement
let testRoot: any
let TestComponent: FC

const oe = console.error

describe('React Hooks ', () => {
  // SET UP
  beforeEach(() => {
    [remote, strategy] = createTestStrategy()
    iotesReactHooks = createIotes({
      topology,
      strategy: phidgetStrategy,
    })

    TestComponent = () => {
      const [deviceVal, setDeviceVal] = iotesReactHooks.useIotesDevice()
      const [hostVal, setHostVal] = iotesReactHooks.useIotesHost()

      useEffect(() => {
        console.log(deviceVal)
      }, [deviceVal])


      useEffect(() => {
        console.log('hostVal', hostVal)
      }, [hostVal])

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

    // expect(newEventFromHook[hosts[0].name].type).toBe('CONNECT')
  })
})

*/
