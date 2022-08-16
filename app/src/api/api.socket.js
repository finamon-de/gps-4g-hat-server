import {io} from "socket.io-client"

export const ApiSocket = () => {

    const url = process.env.REACT_APP_SOCKET_URL || ""
    let callbacks = []
    let socket

    const _connect = (cb) => {
        socket = io(url)
        
        socket.on("connect", () => {
            console.log("Connected")
            if (typeof cb === "function") {
                cb()
            }
        })
        
        socket.on('positions', function(data) {
            callbacks.forEach(cb => { 
                if (typeof cb === "function") { 
                    cb(data) 
                }
            });
        })
        
        socket.on('exception', function(data) {
            console.log('event', data);
        })

        socket.on('disconnect', function() {
         console.log('Disconnected');
        })
    }


    const _addNewPositionCallback = (fn) => {
        if (!callbacks.includes(fn)) {
            callbacks.push(fn)
        }
    }
    

    const _removeNewPositionCallback = (fn) => {
        const copy = [...callbacks]
        callbacks = copy.splice(copy.findIndex(fn), 1)
    }


    return Object.freeze({
        connect: _connect,
        addNewPositionCallback: _addNewPositionCallback,
        removeNewPositionCallback: _removeNewPositionCallback
    })

}