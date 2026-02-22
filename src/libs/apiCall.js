import axios from 'axios'
import { useAuthDrawer } from '@/modules/auth/useAuthDrawer.js'

const { authWindow, userToken } = useAuthDrawer()

export const GET = 'GET'
export const POST = 'POST'
export const DELETE = 'DELETE'
export const PATCH = 'PATCH'
export const PUT = 'PUT'

export class ApiException extends Error {
  constructor (code, message, type) {
    super((code ? `${code} - ` : '') + message)
    this.type = type
  }

  toString () {
    return `[${this.type}]`
  }
}

export class ApiFileDownloadException extends ApiException {
  constructor (fileName, error) {
    const msg = `Ошибка получения файла "${fileName}": ${error}`
    super(100, msg)
    this.name = 'ApiFileDownloadException'
    this.message = msg
    this.error = error
  }

  toString () {
    return `${this.message}`
  }
}

function getApiUrl () {
  const hostname = window.location.hostname
  // const version = 'v1';

  if (hostname.includes('cr2.dev.')) {
    return `https://cr2.dev.corp.rosmedex.ru/api/`
  } else if (hostname.includes('cr2.corp.')) {
    return `https://cr2.corp.rosmedex.ru/api/`
  } else {
    return `http://localhost:3033/api/`
  }
}

export default class Api {
  // static VBA = import.meta.env.VITE_HOST || 'https://cr2.dev.corp.rosmedex.ru'
  // static PORT = Number(import.meta.env.VITE_PORT) || 3000
  // static development = import.meta.env.VITE_NODE_ENV === 'development'
  static axiosConfig = {
    // baseURL: Api.development
    //   ? `http://${Api.VBA}:${Api.PORT}/api/`
    //   : `${Api.VBA}/api/`,
    baseURL: getApiUrl(),
    headers: {
      'Content-type': 'application/json',
    },
  }

  static axios = null
  static #requestCount = 0

  static initAxios (options) {
    const { formData } = options

    if (userToken.value) {
      this.axiosConfig.headers['Authorization'] = `Bearer ${userToken.value}`
    }

    if (formData) {
      this.axiosConfig.headers['Content-type'] = 'multipart/form-data'
    }

    return (this.axios = axios.create(this.axiosConfig))
  }

  static async #defineMethod (method, uri, data) {
    let response

    switch (method) {
      case 'POST': {
        response = await this.axios.post(uri, data)
        break
      }
      case 'PUT': {
        response = await this.axios.put(uri, data)
        break
      }
      case 'PATCH': {
        response = await this.axios.patch(uri, data)
        break
      }
      case 'DELETE': {
        response = await this.axios.delete(uri)
        break
      }
      case 'GET': {
        response = await this.axios.get(uri)
        break
      }
      default: {
        response = await this.axios.get(uri)
      }
    }

    if (response.data.answer !== 'ok') {
      throw new Error(`[${response.data.type}]: ${response.data.message}`)
    }

    return response.data
  }

  static async doAxios (method, uri = '', data, options = {}) {
    this.initAxios(options)

    try {
      return await this.#defineMethod(method, uri, data, options)
    } catch (error) {
      const code = error.response?.status || null

      switch (code) {
        case 401: {
          if (this.#requestCount !== 0) {
            break
          }
          this.#requestCount = 1
          await authWindow()
          return await this.doAxios(method, uri, data, options)
        }
        case 400: {
          throw error.response?.data?.message || 'Как-то так...'
        }
        case 404: {
          // TODO доделать обработку ошибок
          throw 'путь не найден'
        }
        default: {
          throw error
        }
      }
    }
  }

  static async getFile (url, fileName = 'без_имени', signal) {
    try {
      const { data, headers } = await this.axios.get(url, {
        responseType: 'blob',
        signal,
      })
      const blob = new Blob([data], {
        type: headers['content-type'],
      })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = fileName
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (error) {
      throw new ApiFileDownloadException(fileName, error)
    }
  }

  static async get (url = '') {
    const { data } = await this.doAxios(GET, url, null, {})
    return data
  }

  static async post (url = '', dt = {}, options = { formData: false }) {
    const { data } = await this.doAxios(POST, url, dt, options)
    return data
  }

  static async put (url = '', dt = {}) {
    const { data } = await this.doAxios(PUT, url, dt)
    return data
  }

  static async patch (url = '', dt = {}) {
    const { data } = await this.doAxios(PATCH, url, dt, {})
    return data
  }

  static async delete (url = '') {
    const { data } = await this.doAxios(DELETE, url, null, {})
    return data
  }
}
