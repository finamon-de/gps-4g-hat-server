import React, { useCallback, useEffect, useState } from "react"
import { Layout, List, Input, Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { DeviceApi } from "../api/device.api";
import { ApiSocket } from "../api/api.socket";

const { Header, Content, Sider } = Layout;

const mapContainer = {
    width: '100%',
    height: 'calc(100vh - 64px)'
}

const apiSocket = ApiSocket()

export const BaseLayout = () => {

    const [ collapsed, setCollapsed ] = useState(false)
    const [ input, setInput ] = useState("")
    const [ listItemsDevices, setListItemsDevices ] = useState([])
    const [ listItemsPosition, setListItemsPosition ] = useState([])
    const [ devicesToWatch, setDevicesToWatch ] = useState([])
    const [ map, setMap ] = useState(null)
    const [ center, setCenter ] = useState({ lat:51.2291589, lng: 6.7160651 })
    const [ markerData, setMarkerData ] = useState([])

    const newPositionCallback = (data) => {
        console.log(data);
        let copy = [...markerData]
        const index = copy.findIndex(d => d.device === data.device)
        if (index >= 0) {
            copy = copy.splice(index, 1, data)
        } else {
            copy.push(data)
        }
        setMarkerData(copy)
    }

    useEffect(() => {
        const initSocket = () => {
            apiSocket.connect(() => {
                apiSocket.addNewPositonCallback(newPositionCallback)
            })
        }

        initSocket()
    }, [])

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY
    })

    const onLoad = useCallback((_map) => {
        // const bounds = new window.google.maps.LatLngBounds(center)
        // _map.fitBounds(bounds)
        setMap(_map)
    })

    const onUnmount = useCallback((_map) => {
        setMap(null)
    })

    const onInputChange = (event) => {
        setInput(event.target.value)
    }

    const onClickLoadDevices = async (event) => {
        const devices = await DeviceApi().loadDevicesForUser(input)
        setListItemsDevices(devices.data)
    }

    const onClickLoadPositions = async (item) => {
        const positions = await DeviceApi().loadPositionsForDevice(item._id)
        setListItemsPosition(positions.data)
    }

    const onClickWatchDevice = (item) => {
        if (!devicesToWatch.includes(item._id)) {
            const copy = [...devicesToWatch]
            copy.push(item._id)
            setDevicesToWatch(copy)
        } else {
            const copy = [...devicesToWatch]
            const index = copy.findIndex(id => id === item._id)
            const spliced = copy.splice(index, 1)
            setDevicesToWatch(spliced)
        }
    }

    const onClickShowPosition = async (item) => {
        
    }

    const onMarkerLoaded = (marker) => {
        
    }

    return (
        <Layout>
            <Sider width={320} trigger={null} collapsible collapsed={collapsed}>
                <h3 style={{color: 'white', textTransform: 'uppercase'}}>Devices</h3>
                <List
                    itemLayout="vertical"
                    size="small"
                    style={{padding: '16px 8px'}}
                    dataSource={listItemsDevices}
                    renderItem={(item, index) => (
                        <List.Item 
                            style={{ 
                                background: index % 2 == 0 ? '#eee' : '#ebebeb',
                                textAlign: 'start',
                                padding: 8,
                            }}
                            actions={[ 
                                // <a key="load-positions" onClick={() => onClickLoadPositions(item)}>Load positions</a>, 
                                <a key="watch-device" onClick={() => onClickWatchDevice(item)}>{devicesToWatch.includes(item._id) ? "Stop watching" : "Watch"}</a> 
                            ]}
                        >
                            <h4>{item.imei}</h4>
                            <p style={{ fontSize: '0.6rem' }}>{item.ip} <br /> {item.last_contact}</p>
                        </List.Item>
                    )}
                />

                {/* <hr />
                <h3 style={{color: 'white', textTransform: 'uppercase'}}>Positions</h3>
                <List
                    itemLayout="vertical"
                    size="small"
                    style={{padding: '16px 8px'}}
                    dataSource={listItemsPosition}
                    renderItem={(item, index) => (
                        <List.Item 
                            style={{ 
                                background: index % 2 == 0 ? '#eee' : '#ebebeb',
                                textAlign: 'start',
                                padding: 8,
                            }}
                            actions={[ <a key="show-position" onClick={() => onClickShowPosition(item)}>Show</a> ]}
                        >
                            <p style={{ fontSize: '0.8rem' }}>Lat: {item.lat ?? item.latitude ?? undefined } <br />Lng: {item.lng ?? item.longitude ?? undefined}</p>
                        </List.Item>
                    )}
                /> */}
            </Sider>
            <Layout>
                <Header
                    style={{padding: 0}}
                >
                    {
                        React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                            className: 'trigger',
                            onClick: () => setCollapsed(!collapsed),
                        }) && (
                             <Input.Group compact style={{
                                padding: '16px 8px'
                            }}>
                                <Input placeholder="User ID" value={input} onChange={onInputChange} style={{width: 320}} />
                                <Button type="primary" onClick={onClickLoadDevices}>Load</Button>
                            </Input.Group>
                        )
                    }
                </Header>
                <Content
                    style={{
                        minHeight: 'calc(100vh - 64px)'
                    }}
                >
                    {
                        isLoaded && (    
                            <GoogleMap
                                mapContainerStyle={mapContainer}
                                onLoad={onLoad}
                                onUnmount={onUnmount}
                                zoom={14}
                                center={center}
                            >
                                {                                        
                                    markerData.map(d => {
                                        const latLng = new window.google.maps.LatLng((d.latitude || d.lat || 0), (d.longitude || d.lng || 0))
                                        return <Marker position={latLng} onLoad={onMarkerLoaded} label={{text: d.device}} />
                                    })
                                }
                            </GoogleMap>
                        )
                    }
                </Content>
            </Layout>
        </Layout>
    )
}