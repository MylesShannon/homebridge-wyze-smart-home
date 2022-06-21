const { Service, Characteristic } = require('../types')
const WyzeAccessory = require('./WyzeAccessory')

const WYZE_API_POWER_PROPERTY = 'P3'

const noResponse = new Error('No Response')
noResponse.toString = () => { return noResponse.message }

module.exports = class WyzeCamera extends WyzeAccessory {
  constructor (plugin, homeKitAccessory) {
    super(plugin, homeKitAccessory)

    this.getOnCharacteristic().on('set', this.set.bind(this))
  }

  updateCharacteristics (device) {
    if (device.conn_state === 0) {
      this.getOnCharacteristic().updateValue(noResponse)
    } else {
      this.getOnCharacteristic().updateValue(device.device_params.power_switch)
    }
  }

  getSwitchService () {
    let service = this.homeKitAccessory.getService(Service.Switch)

    if (!service) {
      service = this.homeKitAccessory.addService(Service.Switch)
    }

    return service
  }

  getOnCharacteristic () {
    return this.getSwitchService().getCharacteristic(Characteristic.On)
  }

  async set (value, callback) {
    this.plugin.log.debug(`Setting power for ${this.homeKitAccessory.context.mac} (${this.homeKitAccessory.context.nickname}) to ${value}`)

    try {
      await this.setProperty(WYZE_API_POWER_PROPERTY, (value) ? 1 : 0)
      callback()
    } catch (e) {
      callback(e)
    }
  }
}
