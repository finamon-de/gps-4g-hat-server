import React, { useEffect, useState } from "react"
import { Layout, Input, Button, Row, Col } from 'antd';
import { DeviceApi } from "../api/device.api";
import { ApiSocket } from "../api/api.socket";
import { DevicesPanel } from "./components/DevicesPanel";
import { MapboxMap } from "./components/MapboxMap";

const { Header, Content } = Layout

const apiSocket = ApiSocket()

export const BaseLayout = () => {

    const [ input, setInput ] = useState("62bf08378d0a8a16201ef153")
    const [ devicesToWatch, setDevicesToWatch ] = useState([])

    const [ listItemsDevices, setListItemsDevices ] = useState([])
    const [ listItemsPosition, setListItemsPosition ] = useState([])
    const [ listItemsLivePosition, setListItemsLivePosition ] = useState([])
    const [ lastPositionFromCallback, setLastPositionFromCallback ] = useState(null)
    const [ markerData, setMarkerData ] = useState([])
    const [ segments, setSegments ] = useState([])

    const newPositionCallback = (data) => {
        setLastPositionFromCallback(data)
    }

    useEffect(() => {
        const initSocket = () => {
            apiSocket.connect(() => {
                apiSocket.addNewPositionCallback(newPositionCallback)
            })
        }

        initSocket()
    }, [])

    useEffect(() => {
         const updateMarkerData = (data) => {
            // only updated if watched
            if (!devicesToWatch.includes(data.device)) return

            let copy = [...markerData]
            const index = copy.findIndex(d => d.device === data.device)
            if (index >= 0) {
                copy.splice(index, 1, data)
            } else {
                copy.push(data)
            }
            setMarkerData(copy)
        }
       
        const updateLivePositions = (data) => {
            const copy = [...listItemsLivePosition]
            const index = copy.findIndex(el => el.deviceId === data.device)
            
            // replace position data or set new
            if (index >= 0) {
                copy[index].positions.push(data)
            } else {
                const d = listItemsDevices.filter(element => element._id === data.device)
                const imei = d && d.length > 0 ? d[0].imei : 'IMEI unknown'
                copy.push({
                    imei: imei,
                    deviceId: data.device,
                    positions: [data]
                })
            }
            setListItemsLivePosition(copy)
        }

        if(lastPositionFromCallback) {
            updateMarkerData(lastPositionFromCallback)
            updateLivePositions(lastPositionFromCallback)
        }
    }, [lastPositionFromCallback])

    const onInputChange = (event) => {
        setInput(event.target.value)
    }

    const onClickLoadDevices = async (event) => {
        const devices = await DeviceApi().loadDevicesForUser(input)
        setListItemsDevices(devices.data)
    }

    const onClickLoadPositions = async (item) => {
        const positions = await DeviceApi().loadPositionsForDevice(item._id)

        const copy = [...listItemsPosition]
        const index = copy.findIndex(el => el.deviceId === item._id)
        
        // replace position data or set new
        if (index >= 0) {
            copy[index].positions = positions.data
        } else {
            copy.push({
                imei: item.imei,
                deviceId: item._id,
                positions: positions.data
            })
        }

        setListItemsPosition(copy)
    }

    const onClickWatchDevice = (item) => {
        if (!devicesToWatch.includes(item._id)) {
            const copy = [...devicesToWatch]
            copy.push(item._id)
            setDevicesToWatch(copy)
        } else {
            const copy = [...devicesToWatch]
            const index = copy.findIndex(id => id === item._id)
            copy.splice(index, 1)
            setDevicesToWatch(copy)
        }
    }

    const onClickClearPositions = () => {
        setSegments([])
    }

    const onClickShowPositions = async (device) => {
        const entry = listItemsPosition.find(el => el.deviceId === device._id)
        if (!entry) {
            console.warn('No positions to show.')
            return
        }

        let segments = []
        if (Array.isArray(entry.positions)) {
            segments = buildSegments(entry.positions)
        }

        setSegments(segments)
    }

    const buildSegments = (positions) => {
        const segments = []
        let currentDate = []
        let segmentIndex = 0
        positions.forEach(el => {
            const d = new Date(el.utc)
            const month = d.getMonth()
            const date = d.getDate()

            // handle first position
            if (currentDate.size === 0) {
                currentDate = [date, month]
                segments[segmentIndex] = []
                segments[segmentIndex].push(el)
            } else {
                // handle other positions
                const isSameDay = currentDate[0] === date && currentDate[1] === month
                if (isSameDay) {
                    segments[segmentIndex].push(el)
                } else {
                    currentDate = [date, month]
                    segmentIndex++
                    segments[segmentIndex] = []
                    segments[segmentIndex].push(el)
                }
            }
        });
        return segments
    }
    
    return (
        <Layout>
            <Header style={{padding: 0}}>
                <Input.Group compact style={{ padding: '16px 8px', }}>
                    <Input placeholder="User ID" value={input} onChange={onInputChange} style={{width: 320}} />
                    <Button type="primary" onClick={onClickLoadDevices}>Load</Button>
                </Input.Group>
            </Header>
            <Content style={{ minHeight: 'calc(100vh - 64px)' }}>
                <Row>
                    <Col sm={24} md={12}>
                        <MapboxMap markerData={markerData} segments={segments} />
                    </Col>
                    <Col sm={24} md={12} style={{background: '#ffffff'}}>
                        {
                            listItemsDevices.length > 0 ? (
                                <DevicesPanel 
                                    devices={listItemsDevices} 
                                    positions={listItemsPosition}
                                    livePositions={listItemsLivePosition}
                                    watched={devicesToWatch}
                                    onClickLoadPositions={onClickLoadPositions}
                                    onClickShowPositions={onClickShowPositions}
                                    onClickClearPositions={onClickClearPositions}
                                    onClickWatchDevice={onClickWatchDevice} />
                            ) : (
                                <p>Enter a User ID an press 'Load'.</p>
                            )
                        }
                    </Col>
                </Row>
            </Content>
        </Layout>
    )
}