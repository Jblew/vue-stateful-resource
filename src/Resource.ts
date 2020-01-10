// tslint:disable no-namespace

export interface Resource<RESULT_TYPE extends object> {
    loading: boolean
    result: RESULT_TYPE | ''
    error: Resource.ErrorType
  }
  
  export namespace Resource {
    export type ErrorType = Error | string
    export const NO_ERROR: ErrorType = ''
    export const RESULT_NO_SUCCESS = ''
    export const RESULT_SUCCESS_PLACEHOLDER = 'success'
  
    export function empty<RESULT_TYPE extends object>(): Resource<RESULT_TYPE> {
      return { loading: false, error: NO_ERROR, result: RESULT_NO_SUCCESS }
    }
  
    export function success<RESULT_TYPE extends object>(
      result: RESULT_TYPE,
    ): Resource<RESULT_TYPE> {
      return { loading: false, error: NO_ERROR, result }
    }
  
    export function loading<RESULT_TYPE extends object>(): Resource<RESULT_TYPE> {
      return { loading: true, error: NO_ERROR, result: RESULT_NO_SUCCESS }
    }
  
    export function error<RESULT_TYPE extends object>(
      err: ErrorType,
    ): Resource<RESULT_TYPE> {
      return { loading: false, error: err, result: RESULT_NO_SUCCESS }
    }
  
    export function isSuccess<RESULT_TYPE extends object>(
      r: Resource<RESULT_TYPE>,
    ): boolean {
      return r.result !== RESULT_NO_SUCCESS
    }
  
    export function hasError<RESULT_TYPE extends object>(
      status: Resource<RESULT_TYPE>,
    ) {
      return status.error !== NO_ERROR
    }
  
    export function getErrorMessage<RESULT_TYPE extends object>(
      status: Resource<RESULT_TYPE>,
    ) {
      const stError = status.error
      if (typeof stError === 'string') return stError
      else return stError.message
    }
  
    export async function fetchResource<RESULT_TYPE extends object>(
      resourceName: string,
      fetcherFn: () => Promise<RESULT_TYPE>,
      updateStateCb: (status: Resource<RESULT_TYPE>) => void,
      opts: { printError?: boolean } = { printError: true },
    ) {
      try {
        updateStateCb(loading())
        const result = await fetcherFn()
        updateStateCb(success(result))
        return result
      } catch (err) {
        if (opts.printError !== false) {
          // tslint:disable no-console
          console.error(`Error in Resource.fetchResource(${resourceName})`, err)
        }
        updateStateCb(error(err))
        throw err
      }
    }
  
    export function ensureResult<RESULT_TYPE extends object>(
      rs: Resource<RESULT_TYPE>,
      name: string = '',
    ): RESULT_TYPE {
      if (isSuccess(rs)) return rs.result as RESULT_TYPE
      else {
        throw new Error(
          `Resource.ensureResult: resource ${
            name ? name + ' ' : ''
          }is not loaded`,
        )
      }
    }
  
    export function resultOrDefault<RESULT_TYPE extends object>(
      rs: Resource<RESULT_TYPE>,
      defaultV: RESULT_TYPE,
    ): RESULT_TYPE {
      if (isSuccess(rs)) return rs.result as RESULT_TYPE
      else return defaultV
    }
  
    export function lightweight(
      rs: Resource<any>,
    ): Omit<Resource<any>, 'result'> & {
      result: typeof RESULT_SUCCESS_PLACEHOLDER | typeof RESULT_NO_SUCCESS
    } {
      const { result, ...rsWithoutResult } = rs
      const lightWeightResult = isSuccess(rs)
        ? RESULT_SUCCESS_PLACEHOLDER
        : RESULT_NO_SUCCESS
      return { ...rsWithoutResult, result: lightWeightResult }
    }
  }
  