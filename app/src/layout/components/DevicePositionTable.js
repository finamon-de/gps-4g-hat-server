import React, { useState } from "react"
import { Table } from "antd"

const rowKeyId = "index"

const options = {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false,
    timeZone: 'UTC'
};

export const DevicePositionTable = (props) => {

    const positions = props.positions ?? []
    const [pageSize, setPageSize] = useState(10)
    const [page, setPage] = useState(1)

    const columns = [
        {
            title: '#',
            key: 'index',
            render: (value, item, index) => {
                const val = (page - 1) * pageSize + index + 1 // otherwise zero-based
                return `${val}`
            }
        },
        {
            title: 'Timestamp',
            dataIndex: 'utc',
            key: 'utc',
            render: (text) => {
                
                const dateValue = Number.isInteger(text) 
                    ? new Intl.DateTimeFormat('de-DE', options).format(new Date(Number(text)*1000))
                    : "Received invalid value"
                return (
                    <div>
                        <span style={{fontFamily: 'monospace'}}>{text}</span><br />
                        <span style={{fontFamily: 'monospace'}}>{dateValue}</span>
                    </div>
                )
            }
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

    return (
        <Table 
            size={'small'} 
            dataSource={positions} 
            columns={columns} 
            rowKey={rowKeyId}
            pagination={{
                onChange(page, pageSize) {
                    setPage(page)
                    setPageSize(pageSize)
                }
            }}
        />
    )
}