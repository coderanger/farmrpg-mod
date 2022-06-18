import { makeAutoObservable, observable } from 'mobx'

const DEFAULT_LOCAL_STORAGE_KEY = "farmRpgModSettings"

export class Settings {
  key: string
  readonly channels = observable<string>([])

  constructor(localStorageKey: string = DEFAULT_LOCAL_STORAGE_KEY) {
    makeAutoObservable(this)
    this.key = localStorageKey
    const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(localStorageKey)
    if (raw) {
      const data = JSON.parse(raw)
      this.channels.replace(data.channels)
    }
  }

  save() {
    localStorage.setItem(this.key, JSON.stringify({
      channels: this.channels,
    }))
  }

  addChannel(channel: string) {
    if (!this.channels.includes(channel)) {
      this.channels.push(channel)
      this.save()
    }
  }

  removeChannel(channel: string) {
    if (this.channels.includes(channel)) {
      this.channels.replace(this.channels.filter(c => c !== channel))
      this.save()
    }
  }
}
