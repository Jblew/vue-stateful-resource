// tslint:disable no-duplicate-string
import { Resource } from './Resource'

describe('Resource', () => {
  describe('empty', () => {
    const rs = Resource.empty()

    it('isSuccess returns false', () =>
      expect(Resource.isSuccess(rs)).toEqual(false))

    it('hasError returns false', () =>
      expect(Resource.hasError(rs)).toEqual(false))

    it('.loading is false', () => expect(rs.loading).toEqual(false))
  })
  describe('success', () => {
    const rs = Resource.success({ p: 'expected_result' })
    it('isSuccess returns true', () =>
      expect(Resource.isSuccess(rs)).toEqual(true))

    it('hasError returns false', () =>
      expect(Resource.hasError(rs)).toEqual(false))

    it('.loading is false', () => expect(rs.loading).toEqual(false))

    it('holds result', () =>
      expect(rs.result).toEqual({ p: 'expected_result' }))
  })
  describe('loading', () => {
    const rs = Resource.loading()

    it('isSuccess returns false', () =>
      expect(Resource.isSuccess(rs)).toEqual(false))

    it('hasError returns false', () =>
      expect(Resource.hasError(rs)).toEqual(false))

    it('.loading is true', () => expect(rs.loading).toEqual(true))
  })
  //
  ;[
    { name: 'error string', e: 'test' },
    { name: 'error object', e: new Error('test') },
  ].forEach(test =>
    describe(`error[${test.name}]`, () => {
      const rs = Resource.error(test.e)

      it('isSuccess returns false', () =>
        expect(Resource.isSuccess(rs)).toEqual(false))

      it('hasError returns true', () =>
        expect(Resource.hasError(rs)).toEqual(true))

      it('.loading is false', () => expect(rs.loading).toEqual(false))
    }),
  )

  describe('getErrorMessage', () => {
    it('Resurns empty string on no error', () => {
      const rs = Resource.empty()
      expect(Resource.getErrorMessage(rs)).toEqual('')
    })

    it('Resurns message of error object', () => {
      const rs = Resource.error(new Error('expected_error'))
      expect(Resource.getErrorMessage(rs)).toEqual('expected_error')
    })

    it('Resurns string error directly', () => {
      const rs = Resource.error('expected_error')
      expect(Resource.getErrorMessage(rs)).toEqual('expected_error')
    })
  })

  describe('fetchResource', () => {
    it('Notifies with loading immediately after run', async () => {
      const calls: Array<Resource<{}>> = []
      const resourceService = () => Promise.resolve({})

      await Resource.fetchResource<{}>('res name', resourceService, s =>
        calls.push(s),
      )

      expect(calls.length).toEqual(2)
      expect(calls[0].loading).toEqual(true)
    })

    it('Notifies with success with result after promise is resolved', async () => {
      const calls: Array<Resource<{}>> = []
      const resourceService = () => Promise.resolve({})

      await Resource.fetchResource<{}>('res name', resourceService, s =>
        calls.push(s),
      )

      expect(calls.length).toEqual(2)
      expect(Resource.isSuccess(calls[1])).toEqual(true)
    })

    it('Notifies with error with result after promise is rejected', async () => {
      const calls: Array<Resource<{}>> = []
      const resourceService = () => Promise.reject(new Error('rejection'))

      try {
        await Resource.fetchResource<{}>(
          'res name',
          resourceService,
          s => calls.push(s),
          { printError: false },
        )
      } catch (e) {
        //
      } finally {
        expect(calls.length).toEqual(2)
        expect(Resource.hasError(calls[1])).toEqual(true)
      }
    })

    it('Throws rejection error', async () => {
      const resourceService = () => Promise.reject(new Error('rejection'))

      let thrownError: Error | undefined
      try {
        await Resource.fetchResource<{}>(
          'res name',
          resourceService,
          () => ({}),
          { printError: false },
        )
      } catch (e) {
        thrownError = e
      } finally {
        expect(thrownError).toBeTruthy()
      }
    })

    it('Is resolved with result (not Resource)', async () => {
      const resourceService = () => Promise.resolve({})

      const resolved = await Resource.fetchResource<{}>(
        'res name',
        resourceService,
        () => ({}),
      )
      expect(resolved).toEqual({})
    })
  })

  describe('ensureResult', () => {
    it('Returns result if success', () => {
      const rs = Resource.success({})
      expect(Resource.ensureResult(rs)).toEqual({})
    })

    it('Throws error if not success', () => {
      const rs = Resource.empty()
      expect(() => Resource.ensureResult(rs)).toThrowError()
    })
  })

  describe('resultOrDefault', () => {
    it('Returns result if success', () => {
      const rs = Resource.success({})
      expect(Resource.resultOrDefault(rs, { d: 'efault' })).toEqual({})
    })

    it('Returns default value if not success', () => {
      const rs = Resource.error('error')
      expect(Resource.resultOrDefault(rs, { d: 'efault' })).toEqual({
        d: 'efault',
      })
    })
  })

  describe('lightweight', () => {
    it('Replaces result with success placeholder', () => {
      const rs = Resource.success({ a: 'b' })
      const lightweightRs = Resource.lightweight(rs)
      expect(lightweightRs.result).toEqual('success')
    })
  })
})
