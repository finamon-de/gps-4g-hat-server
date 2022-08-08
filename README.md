# Welcome

This repository contains a demo application to test our GPS 4G HAT.

If you are searching for the library to assist you with the development using the GPS 4G HAT, head over to this repo: [LINK]()

# Content

This repository contains four projects.

- `app`
- `mqtt-client`
- `server`
- `websocket-client`

The most important ones are `app` and `server`.

`app` contains a web application that fetches the data from an API that is provided by the `server`. 

The `app` uses the map data from Mapbox.
To see map tiles you need to have a Mapbox API key.
You can simply head over to their website ([here](https://mapbox.com)) and create an account, if you haven't already.
When it is done, you copy the `default` key to get started.

`mqtt-client` and `websocket-client` are two test applications you can use to check whether the MQTT and websocket endpoints of the API are correctly set up.

# Installation

For detailed installation steps check the *readme* files of the projects in the sub-folders.

## Summary

The projects are either written in Javascript or TypeScript. To compile the projects you will need to have `node` and `npm` installed.

As the server saves data and serves an MQTT endpoint there are two addtional software parts that need to be installed or provided in some way.

In its current state the server simply uses MongoDB to store data.
You can check the official website on how to install it [here](https://www.mongodb.com/try/download/community).

The second part that is required is a possibility to provide MQTT. For now the server project relies on Mosquitto. You can check how to install it [here](https://mosquitto.org/download/).

# How to contribute

If you like to you can contribute.
Please have a look at the `CONTRIBUTING.md` file.

# License

This repository is licensed under MIT license.
For more information take a look at the `LICENSE.md` file.