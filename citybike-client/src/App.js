import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import axios from "axios";
import moment from 'moment';
import Moment from "react-moment";
import { Map, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";

class App extends Component {
  constructor() {
    super();
    this.toogleMode = this.toogleMode.bind(this);
    this.getPrevious = this.getPrevious.bind(this);
    this.getNext = this.getNext.bind(this);
    this.getTimeToShow = this.getTimeToShow.bind(this);

    this.state = {
      response: false,
      endpoint: "http://127.0.0.1:4001",
      lat: 25.762406,
      lng: -80.212388,
      zoom: 13,
      realTime: true,
      stations: [],
      limit: 0,
      step: 0
    };
  }

  componentDidMount() {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    socket.on('info', data => {
        const { stations, limit } = data;

        if (this.state.realTime) {
            this.setState({ stations, limit, step: limit});
        }else {
            this.setState({ limit });
        }
    })
  }

  toogleMode() {
      this.setState(prevState => ({
          realTime: !prevState.realTime
      }));
  }

  async getStations() {
    const response = await axios.get( `${this.state.endpoint}/history?step=${this.state.step}`);
    const { stations, limit } = response.data;
    this.setState({ stations, limit });
  }

  getPrevious() {
    this.setState(prevState => ({
        step: prevState.step - 1
    }), async function() {
        await this.getStations()
    })
  }

  getNext() {
    this.setState(prevState => ({
        step: prevState.step + 1
    }), function() {
        this.getStations()
    })
  }

  getColor(station) {
      const { free_bikes } = station.availability;
      return (free_bikes > 6 ? 'green' : free_bikes ? 'orange' : 'red');
  }

  getTimeToShow() {
    const {step, limit} = this.state;
    const ago = limit - step;
    return moment().subtract(ago, 'minutes');
  }

  renderStations() {
    var componentCircle = this.state.stations.map(
        (station, idx) => {
            const coords = station.location.coordinates.reverse();
            const { free_bikes, empty_slots } = station.availability;
          return (
            <div key={idx}>
              <CircleMarker
                center={coords}
                color={this.getColor(station)}
                radius={5}
              />
              <Marker key={idx} position={coords}>
                <Popup>
                  <h3>{station.name}</h3>
                  Bikes free { free_bikes } <br />
                  Slots free { empty_slots } <br />
                </Popup>
              </Marker>
            </div>
          );
        },
      );
      return componentCircle;
  }
  render() {
    const position = [this.state.lat, this.state.lng];
    return (
        <>
            <div className="map">
                <h1> City Bikes in Miami </h1>
                <h3>
                    Showing info {" "}
                    { this.state.realTime ? 'in real time' : <Moment fromNow>{this.getTimeToShow()}</Moment>}
                </h3>
                <Map center={position} zoom={this.state.zoom}>
                <TileLayer
                    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {this.state.stations ? this.renderStations() : null}
                </Map>
            </div>
            <div className="travel">
                <h2>Select how to show the information</h2>
                    Change to: {" "}
                    <button
                        onClick={this.toogleMode}
                        >
                        {this.state.realTime ? 'Time Traveling' : 'Real Time' }
                    </button>
                { !this.state.realTime ?  (
                    <div>
                        <button onClick={this.getPrevious} disabled={!this.state.step}>prev</button>
                        <button onClick={this.getNext} disabled={this.state.step >= this.state.limit - 1}>next</button>
                    </div>
                 ) : ''
                }
            </div>
        </>
    );
  }
}
export default App;
