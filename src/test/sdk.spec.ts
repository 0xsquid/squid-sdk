import { Environment } from '../types'
import SquidSdk from '../index'

jest.mock('axios')

describe('SquidSdk', () => {
  it('should instance SquidSdk as expected', async () => {
    const squidSdk = new SquidSdk({
      environment: Environment.LOCAL
    })

    expect(squidSdk).toMatchSnapshot()
    expect(squidSdk.inited).toBe(false)
    expect(squidSdk.config).toStrictEqual({
      environment: Environment.LOCAL
    })
    expect(squidSdk.tokens).toBe(undefined)
    expect(squidSdk.chains).toBe(undefined)
  })

  describe('setConfig', () => {
    it('should set config as expected', () => {
      const squidSdk = new SquidSdk({
        environment: Environment.LOCAL
      })

      squidSdk.setConfig({
        environment: Environment.TESTNET
      })

      expect(squidSdk.config).not.toStrictEqual({
        environment: Environment.LOCAL
      })
      expect(squidSdk.config).toStrictEqual({
        environment: Environment.TESTNET
      })
    })
  })
})
