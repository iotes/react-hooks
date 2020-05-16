import { create, act } from 'react-test-renderer'
import React, { FC, useState } from 'react'
import { TopologyMap, createDeviceDispatchable } from '@iotes/core'
import { createLocalStoreAndStrategy } from './utils/strategies/local'
import { createIotes } from '../src/index'

const el = React.createElement

// Test data
const testTopologoy: TopologyMap<{}, 'RFID_READER' | 'ROTARY_ENCODER'> = {
  hosts: [{ name: 'testapp/0', host: 'localhost', port: '8888' }],
  client: { name: 'client' },
  devices: [
    {
      hostName: 'testapp/0',
      type: 'RFID_READER',
      name: 'READER/1',
      channel: 1,
    },
    {
      hostName: 'testapp/0',
      type: 'ROTARY_ENCODER',
      name: 'ENCODER/1',
      channel: 2,
    },
  ],
}

let iotes: any
let localStore: any
let createLocalStrategy: any
let TestRender: any
let testRoot: any
let TestComponent: FC
let testBroker: any
let testClient: any
const oe = console.error

describe('React Hooks ', () => {
  // Set up
  beforeEach(() => {
    [localStore, createLocalStrategy] = createLocalStoreAndStrategy()
    const { useIotesHost, useIotesDevice } = createIotes(
      testTopologoy,
      createLocalStrategy,
    )

    TestComponent = () => {
      const [isSent, setIsSent] = useState(false)
      const [deviceVal, setDeviceVal] = useIotesDevice()
      const [hostVal, setHostVal] = useIotesHost()

      if (!isSent) {
        setDeviceVal(createDeviceDispatchable('DEVICE', 'TEST', { message: 'test' }))
        setIsSent(true)
      }

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
    localStore = null
    console.error = oe
  })

  // Tests
  test('Can intergrate with react hooks and receive host updates ', async () => {
    expect(testRoot.toJSON()).not.toBe(null)

    const { hosts } = testTopologoy

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

    const { devices } = testTopologoy

    // Surpress console errors to stop act errors logging as
    // state update within iotes cannot use act method from test tenderer
    console.error = jest.fn()

    const newComponent: any = await new Promise((res) => {
      setTimeout(() => res(testRoot.toJSON()), 50)
    })

    const newEventFromHook = JSON.parse(newComponent[1].children)

    // Dynamically adjust to given test topology
    expect(
      Object.keys(newEventFromHook).filter((e) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const d of devices) {
          if (e === d.name) return true
        }

        return false
      }).length,
    ).toEqual(devices.length)
  })

  test('Can dispatch with react hooks and receive device updates ', async () => {
    expect(testRoot.toJSON()).not.toBe(null)

    const { devices } = testTopologoy

    // Surpress console errors to stop act errors logging as state update
    // within iotes cannot use act method from test tenderer
    console.error = jest.fn()

    const newComponent: any = await new Promise((res) => {
      setTimeout(() => res(testRoot.toJSON()), 50)
    })

    const newEventFromHook = JSON.parse(newComponent[1].children)

    expect(newEventFromHook).toHaveProperty('DEVICE')
    expect(newEventFromHook.DEVICE.payload).toStrictEqual({ message: 'test' })
  })
})
