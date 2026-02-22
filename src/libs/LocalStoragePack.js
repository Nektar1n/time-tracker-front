import lz from 'lz-string'

function compressData(uncompressed) {
  return lz.compressToBase64(uncompressed)
}

function decompressData(compressed) {
  return lz.decompressFromBase64(compressed)
}

export default class LocalStoragePack {
  static sKey(key) {
    return String(key ?? 'default')
  }

  static saveSimple(key, value, compress = true) {
    const sKey = this.sKey(key)

    try {
      if (compress) {
        localStorage.setItem(sKey, compressData(String(value ?? '')))
        return compressData(String(value ?? ''))
      } else {
        localStorage.setItem(sKey, String(value ?? ''))
      }
    } catch (error) {
      this.clear(sKey)
      throw error
    }
  }

  static loadSimple(key, defValue = '') {
    const sKey = this.sKey(key)
    let value = localStorage.getItem(sKey)

    if (value) {
      value = decompressData(localStorage.getItem(sKey) ?? '')
    }

    return value ?? String(defValue)
  }

  static saveObject(key, value, compress = true) {
    const sKey = this.sKey(key)
    try {
      value = value ? JSON.stringify(value) : ''

      if (compress) {
        localStorage.setItem(sKey, compressData(value))
      } else {
        localStorage.setItem(sKey, value)
      }
    } catch (error) {
      this.clear(sKey)
      throw error
    }
  }

  static loadObject(key, defValue = null) {
    const sKey = this.sKey(key)
    let value = localStorage.getItem(sKey)

    if (value) {
      value = decompressData(localStorage.getItem(sKey))
    }

    try {
      return value ? JSON.parse(value) : defValue
    } catch {
      return defValue
    }
  }

  static clear(key) {
    localStorage.removeItem(this.sKey(key))
    return this
  }
}
