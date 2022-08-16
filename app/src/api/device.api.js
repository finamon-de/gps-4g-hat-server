import axios from "axios";

export const DeviceApi = () => {
    const baseUrl = process.env.REACT_APP_API_URL

    const _loadDevicesForUser = async (userId) => {
        try {
            return await axios.get(`${baseUrl}/devices?userId=${userId}`)
        } catch(e) {
            console.error(e)
        }
        return { data: [] };
    }

    const _loadPositionsForDevice = async (deviceId) => {
        try {
            return await axios.get(`${baseUrl}/positions?deviceId=${deviceId}`)
        } catch(e) {
            console.error(e)
        }
        return { data: [] }
    }

    const _loadLatestPositionForDevice = async (deviceId) => {
        try {
            return await axios.get(`${baseUrl}/positions/latest?deviceId=${deviceId}`)
        } catch(e) {
            console.error(e)
        }
        return { data: [] }
    }

    return Object.freeze({
        loadDevicesForUser: _loadDevicesForUser,
        loadPositionsForDevice: _loadPositionsForDevice,
        loadLastestPositionForDevice: _loadLatestPositionForDevice
    })
}