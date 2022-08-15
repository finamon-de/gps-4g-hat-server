import React, { useEffect, useRef, useState } from "react"
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { generateRandomColor } from "../../helper/OperationHelper";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN

export const MapboxMap = (props) => {

    const segments = props.segments ?? []
    const markerData = props.markerData ?? []

    const mapContainer = useRef(null);
    const map = useRef(null);

    const [zoom, setZoom] = useState(9);
    const [ center, setCenter ] = useState({ lat:51.2291589, lng: 6.7160651 })
    const [ markers, setMarkers ] = useState([])
    
    const [ polylineSource, setPolylineSource ] = useState()
    const [ circleSource, setCircleSource ] = useState()

    useEffect(() => {

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

        map.current.on('click', 'polyline-markers', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const lat = coordinates[1]
            const lng = coordinates[0]
            const utc = e.features[0].properties.utc ?? 0
            const timestamp = new Date(utc).toISOString()

            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup({anchor: 'bottom' })
                .setLngLat(coordinates)
                .setHTML(
                    `<span style="font-family: monospace">Lat: ${lat}<br>Lng: ${lng}<br/>Time: ${timestamp}</span>`
                )
                .addTo(map.current);
        })

    }, [])


    useEffect(() => {
        if (!mapContainer.current) return

        const newMarkers = markerData.map((item, index) => {
            return new mapboxgl.Marker()
                .setLngLat([item.longitude, item.latitude])
                .setPopup(new mapboxgl.Popup()
                    .setHTML(
                        `<p style="font-family:monospace;">${item.device}<br/>Lat: ${item.latitude}<br/>Lng: ${item.longitude}</p>`
                    )
                )
                .addTo(map.current)
        })

        // for simplicity remove all before adding new ones
        // could be more elegant using a diff
        markers.forEach(marker => marker.remove())

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

    useEffect(() => {
        const lineStringFeatures = buildLineStringFeatures(segments)
        setPolylineSource(lineStringFeatures)

        const circleFeatures = buildCircleFeatures(segments)
        setCircleSource(circleFeatures)
    }, [segments])

    const buildLineStringFeatures = (segments) => {
        const features = []
        segments.forEach((item, index) => {
            const coordinates = item
                .filter(el => el.longitude !== undefined && el.latitude !== undefined)
                .map(el => { return [ el.longitude, el.latitude ] }) ?? []
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
            const coordinates = item
                .filter(el => el.longitude !== undefined && el.latitude !== undefined)
                .map(el => { return el }) ?? []
            const color = generateRandomColor()
            coordinates.forEach(c => {
                features.push({
                    type: 'Feature',
                    properties: {
                        color: color,
                        utc: c.utc ?? 0
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [ c.longitude, c.latitude ]
                    }
                })
            })
            
        });

        return features
    }

    return (
        <div ref={mapContainer} className="map-container" style={{width: '100%', height: 'calc(100vh - 64px)'}} />
    )
}