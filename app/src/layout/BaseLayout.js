import React, { useCallback, useEffect, useState, useRef } from "react"
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { Layout, List, Input, Button, Card, Grid, Row, Col, Tabs, Tooltip, Table } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import { DeviceApi } from "../api/device.api";
import { ApiSocket } from "../api/api.socket";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN

const { Header, Content, Sider } = Layout

const mapContainer = {
    width: '100%',
    height: 'calc(100vh - 64px)'
}

const apiSocket = ApiSocket()

export const BaseLayout = () => {

    
    const [ input, setInput ] = useState("")
    const [ devicesToWatch, setDevicesToWatch ] = useState([])
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [zoom, setZoom] = useState(9);
    const [ center, setCenter ] = useState({ lat:51.2291589, lng: 6.7160651 })
    const [ markerData, setMarkerData ] = useState([])
    const [ markers, setMarkers ] = useState([])

    const [ polylineSource, setPolylineSource ] = useState()
    const [ circleSource, setCircleSource ] = useState()

    const [ listItemsDevices, setListItemsDevices ] = useState([])
    const [ listItemsPosition, setListItemsPosition ] = useState([])

    const [ pathOptions, setPathOptions ] = useState([])
    const [ polylines, setPolylines ] = useState([])
    const polylinesRef = useRef([])

    const newPositionCallback = (data) => {
        console.log(data);
        let copy = [...markerData]
        const index = copy.findIndex(d => d.device === data.device)
        if (index >= 0) {
            copy.splice(index, 1, data)
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


        if (map.current) return; // initialize map only once
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [center.lng, center.lat],
                zoom: zoom
            });
            map.current.on('load', () => {
                map.current.addSource('polylines', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: []
                    }
                })
                map.current.addLayer({
                    id: 'polylines',
                    type: 'line',
                    source: 'polylines',
                    paint: {
                        "line-width": 3,
                        "line-color": [ "get", "color" ]
                    }
                })
                map.current.addSource('polyline-markers', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: []
                    }
                })
                map.current.addLayer({
                    id: 'polyline-markers',
                    type: 'circle',
                    source: 'polyline-markers',
                    paint: {
                        "circle-radius": 5,
                        "circle-color": [ "get", "color" ]
                    },
                })
            })
    }, [])

    useEffect(() => {
        if (!mapContainer.current) return

        const newMarkers = markerData.map((item, index) => {
            return new mapboxgl.Marker().setLngLat(item.longitude, item.latitude).addTo(map)
        })

        setMarkers(newMarkers)

    }, [markerData])

    useEffect(() => {
        if (!map.current) return
        if (!map.current.getSource('polylines')) return
        if (!polylineSource) return

        const geojsonSource = map.current.getSource('polylines')
        geojsonSource.setData({
            type: 'FeatureCollection',
            features: polylineSource
        })
        
    }, [polylineSource])
    
    useEffect(() => {
        if (!map.current) return
        if (!map.current.getSource('polyline-markers')) return
        if (!circleSource) return

        const geojsonSource = map.current.getSource('polyline-markers')
        geojsonSource.setData({
            type: 'FeatureCollection',
            features: circleSource
        })
        
    }, [circleSource])

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
        setPolylineSource([])
        setCircleSource([])
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

        const lineStringFeatures = buildLineStringFeatures(segments)
        setPolylineSource(lineStringFeatures)

        const circleFeatures = buildCircleFeatures(segments)
        setCircleSource(circleFeatures)
    }

    const buildLineStringFeatures = (segments) => {
        const features = []
        segments.forEach((item, index) => {
            const coordinates = item.filter(el => el.longitude !== undefined && el.latitude !== undefined).map(el => { return [ el.longitude, el.latitude ] }) ?? []
            const color = generateRandomColor()
            features.push({
                type: 'Feature',
                properties: {
                    color: color
                },
                geometry: {
                    type: 'LineString',
                    coordinates: coordinates
                }
            })
        });

        return features
    
    }
    const buildCircleFeatures = (segments) => {
        const features = []
        segments.forEach((item, index) => {
            const coordinates = item.filter(el => el.longitude !== undefined && el.latitude !== undefined).map(el => { return [ el.longitude, el.latitude ] }) ?? []
            const color = generateRandomColor()
            coordinates.forEach(c => {
                features.push({
                    type: 'Feature',
                    properties: {
                        color: color
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: c
                    }
                })
            })
            
        });

        return features
    }

    const generateRandomColor = () => {
        let maxVal = 0xFFFFFF; // 16777215
        let randomNumber = Math.random() * maxVal; 
        randomNumber = Math.floor(randomNumber);
        randomNumber = randomNumber.toString(16);
        let randColor = randomNumber.padStart(6, 0);   
        return `#${randColor.toUpperCase()}`
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

    const onMarkerLoaded = (marker) => {
        
    }

    const onTabChanged = (key) => {

    }

    const renderTab = (device, index) => (
        <Tabs.TabPane tab={device.imei ?? 'Undefined IMEI'} key={index}>
            { renderTabContent(device, index) }
        </Tabs.TabPane>
    )

    const renderTabContent = (device, index) => {
        const entries = listItemsPosition.filter(item => item.deviceId === device._id)
        const positions = entries.length > 0 ? entries[0].positions : []  // should only contain one element
        return (
            <div key={'tab-content-'+index} style={{padding: 8}}>
                <Row gutter={16}>
                    <Col>
                        <Tooltip title={ devicesToWatch.includes(device._id) ? 'Unwatch' : 'Watch'}>
                            <Button 
                                shape={'circle'}
                                icon={ devicesToWatch.includes(device._id) 
                                    ? <EyeInvisibleOutlined key={'unwatch'} style={{color: '#ff0000'}} onClick={() => onClickWatchDevice(device)} /> 
                                    : <EyeOutlined key={'watch'} style={{color: '#1da57a'}} onClick={() => onClickWatchDevice(device)} /> }
                            />
                        </Tooltip>
                    </Col>
                    <Col>
                        <Button onClick={() => onClickLoadPositions(device)} type={'primary'}>Load Positions</Button>
                    </Col>
                    <Col>
                        <Button onClick={() => onClickShowPositions(device)} type={'primary'}>Show Path</Button>
                    </Col>
                    <Col>
                        <Button onClick={() => onClickClearPositions()} type={'default'}>Clear Path</Button>
                    </Col>
                </Row>
                <Row>
                    <Col xs={24} style={{paddingTop: 32}}>
                        { renderPositionTable(positions) }
                    </Col>
                </Row>
            </div>
        )
    }

    const renderPositionTable = (positions) => {
        const columns = [
            {
                title: 'Timestamp',
                dataIndex: 'utc',
                key: 'utc',
                render: (text) => <div><span style={{fontFamily: 'monospace'}}>{text}</span><br /><span style={{fontFamily: 'monospace'}}>{new Date(text).toISOString()}</span></div>
            },
            {
                title: 'Latitude',
                dataIndex: 'latitude',
                key: 'latitude',
                render: (text) => <span style={{fontFamily: 'monospace'}}>{text}</span>
            },
            {
                title: 'Longitude',
                dataIndex: 'longitude',
                key: 'longitude',
                render: (text) => <span style={{fontFamily: 'monospace'}}>{text}</span>
            },
        ]


        return (<Table size={'small'} dataSource={positions} columns={columns} rowKey={'_id'} />)
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
                        <div ref={mapContainer} className="map-container" style={{width: '100%', height: 'calc(100vh - 64px)'}} />
                    </Col>
                    <Col sm={24} md={12} style={{background: '#ffffff'}}>
                        {
                            listItemsDevices.length > 0 ? (
                                <Tabs defaultActiveKey="0" onChange={onTabChanged} type={'card'}>
                                    { listItemsDevices.map((item, index) => { return renderTab(item, index) })}
                                </Tabs>
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