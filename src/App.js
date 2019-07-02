import React, { Component } from 'react';
import { GoogleApiWrapper, InfoWindow, Marker } from 'google-maps-react';

import CurrentLocation from './Map';

export class MapContainer extends Component {
  state = {
    showingInfoWindow: false,
    activeMarker: {},
    selectedPlace: {}
  };

  render() {
    let iconMarker = new window.google.maps.MarkerImage(
      "https://www.imobelo.com.br/img/point.png",
      null, /* size is determined at runtime */
      null, /* origin is 0,0 */
      null, /* anchor is bottom center of the scaled image */
      new window.google.maps.Size(45, 60)
    );

    return (
      <CurrentLocation centerAroundCurrentLocation google={this.props.google} position={this.props.position}>
        <Marker icon={iconMarker} />
      </CurrentLocation>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyCXPixQua9NpsjwLDnhBnhe3qv-yzlv4z4'
})(MapContainer);
