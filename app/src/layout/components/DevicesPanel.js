import React from "react"
import { Tabs, Row, Col, Button, Tooltip, Typography } from "antd"
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons"
import { DevicePositionTable } from "./DevicePositionTable"
import { isFunction } from "../../helper/OperationHelper"

export const DevicesPanel = (props) => {

    const devices = props.devices ?? []
    const positions = props.positions ?? []
    const livePositions = props.livePositions ?? []
    const watchedDevices = props.watched ?? []

    const {
        onClickLoadPositions,
        onClickShowPositions,
        onClickClearPositions,
        onClickWatchDevice
    } = props

    const loadPositions = (item) => {
        if (!isFunction(onClickLoadPositions)) return
        onClickLoadPositions(item)
    }

    const showPositions = (item) => {
        if (!isFunction(onClickShowPositions)) return
        onClickShowPositions(item)
    }

    const clearPositions = (item) => {
        if (!isFunction(onClickClearPositions)) return
        onClickClearPositions(item)
    }

    const watchDevice = (item) => {
        if (!isFunction(onClickWatchDevice)) return
        onClickWatchDevice(item)
    }

    const WatchButton = (btnProps) => <Tooltip title={btnProps.isWatched ? 'Unwatch' : 'Watch'}>
        <Button 
            shape={'circle'}
            icon={ btnProps.isWatched 
                ? <EyeInvisibleOutlined key={'unwatch'} style={{color: '#ff0000'}} onClick={() => watchDevice(btnProps.item)} /> 
                : <EyeOutlined key={'watch'} style={{color: '#1da57a'}} onClick={() => watchDevice(btnProps.item)} /> }
        /> <Typography.Text>(Un)Watch device</Typography.Text>
    </Tooltip>
    const LoadButton = (btnProps) => <Button onClick={() => loadPositions(btnProps.item)} type={'primary'}>Load Positions</Button>
    const ShowButton = (btnProps) => <Button onClick={() => showPositions(btnProps.item)} type={'primary'}>Show Path</Button>
    const ClearButton = (btnProps) => <Button onClick={() => clearPositions(btnProps.item)} type={'default'}>Clear Path</Button>

    return (
        <Tabs defaultActiveKey="0" type={'card'}>
            { 
                devices.map((item, index) => {
                    const isWatched = watchedDevices.includes(item._id)

                    const entries = positions.filter(element => element.deviceId === item._id)
                    const posArray = entries.length > 0 ? entries[0].positions : []  // should only contain one element

                    const liveEntries = livePositions.filter(element => element.deviceId === item._id)
                    const livePosArray = liveEntries.length > 0 ? liveEntries[0].positions : []  // should only contain one element
                    
                    return (
                        <Tabs.TabPane tab={item.imei ?? 'Undefined IMEI'} key={index}>
                            <div key={'tab-content-'+index} style={{padding: 8}}>
                                <Row>
                                    <Col>
                                        <Typography.Title level={4}>Live Positions</Typography.Title>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col>
                                        <WatchButton item={item} isWatched={isWatched} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={24} style={{paddingTop: 32}}>
                                        <DevicePositionTable positions={livePosArray} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Typography.Title level={4}>Static Position History</Typography.Title>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col>
                                        <LoadButton item={item} />
                                    </Col>
                                    <Col>
                                        <ShowButton item={item} />
                                    </Col>
                                    <Col>
                                        <ClearButton item={item} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={24} style={{paddingTop: 32}}>
                                        <DevicePositionTable positions={posArray} />
                                    </Col>
                                </Row>
                            </div>
                        </Tabs.TabPane>
                    )
                })
            }
        </Tabs>
    )
}