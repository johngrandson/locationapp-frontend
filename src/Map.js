import React from 'react';
import ReactDOM from 'react-dom';
import API from './service/api';
import './style.css';
import socketIOClient from "socket.io-client";


export class CurrentLocation extends React.Component {
  constructor(props) {
    super(props);

    const { lat, lng } = this.props.initialCenter;

    this.state = {
      currentLocation: {
        lat: -23.555396,
        lng: -46.661358
      },
      show: false,
      lines: [],
      search: '',
      locationId: '',
      endpoint: `http://localhost:3001`,
    };
  }
  componentDidMount() {
    this.loadMap();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.google !== this.props.google) {
      this.loadMap();
    }
    if (prevState.currentLocation !== this.state.currentLocation) {
      this.recenterMap();
    }
  }

  loadMap() {
    if (this.props && this.props.google) {
      // checks if google is available
      const { google } = this.props;
      const maps = google.maps;

      const mapRef = this.refs.map;

      // reference to the actual DOM element
      const node = ReactDOM.findDOMNode(mapRef);

      let { zoom } = this.props;
      const { lat, lng } = this.state.currentLocation;
      const center = new maps.LatLng(lat, lng);
      const mapConfig = Object.assign(
        {},
        {
          center: center,
          zoom: zoom
        }
      );
      // maps.Map() is constructor that instantiates the map
      this.map = new maps.Map(node, mapConfig);
    }
  }

  recenterMap() {
    const map = this.map;
    const current = this.state.currentLocation;

    const google = this.props.google;
    const maps = google.maps;

    if (map) {
      let center = new maps.LatLng(current.lat, current.lng);
      map.panTo(center);
    }
  }

  renderChildren() {
    const { children } = this.props;

    if (!children) return;

    return React.Children.map(children, c => {
      if (!c) return;
      return React.cloneElement(c, {
        map: this.map,
        google: this.props.google,
        mapCenter: this.state.currentLocation,
        position: this.state.currentLocation
      });
    });
  }

  handleChange = (e) => {
    this.setState({ search: e.target.value })
  }

  handleLocationChange = (e) => {
    this.setState({ locationId: e.target.value })
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    const { search } = this.state;
    const lines = await API.get(`/lines?busca=${search}`);
    this.setState({
      lines: lines.data,
      show: true
    });
  }

  handleBusSelect = async (e, id) => {
    e.preventDefault();
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    socket.emit('send data', id)
    socket.on("outgoing data", data => {
        this.setState({
          currentLocation: {
            lat: data.lat,
            lng: data.lng
          }
        })
        
        if (data === "No data") {
          alert('Localização inativa!');
          this.handleClear();
        }
    });
    this.setState({
      locationId: id,
      show: false,
    })
    this.loadMap();
  }

  handleClear = () => {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    socket.emit('send data', '')
    navigator.geolocation.getCurrentPosition(pos => {
      const coords = pos.coords;
      this.setState({
        currentLocation: {
          lat: coords.latitude,
          lng: coords.longitude
        }
      });
    });
    this.setState({ locationId: '' })
  }

  renderList = (lines) => {
    return (
      <div className="search-box input">
        {lines.length > 0 && (
          <form role="form" id="form-map" className="form-map form-search">
            <h2>Lista de Onibus</h2>
            <input type="hidden" id="filter_property" name="filter_property"/>
              <div className="form-group">
                <ul style={this.handleBusSelect.divStyle}>
                  {lines.map((res, i) => (
                    <li key={res.Letreiro + i} onClick={(e) => this.handleBusSelect(e, res.CodigoLinha)}>{res.Letreiro} - {res.DenominacaoTPTS}/{res.DenominacaoTSTP}</li>
                  ))}
                </ul>
              </div>
          </form>
        )}
      </div>
    )
  }

  render() {
    const { lines, show } = this.state;
    return (
      <div>
        <div className="container row">
          <form className="input" onSubmit={this.handleSubmit}>
            <input type="text" name="locationId" placeholder="Entre com seu destino..." onChange={this.handleChange}/>
            <input type="submit" value="Submit" />
          </form>
          <button className="input clear-btn" onClick={this.handleClear}>Stop tracking</button>
        </div>
        {show && this.renderList(lines)}
        {lines.message && (
          <form role="form" id="form-map" className="form-map form-search">
            <h2 className="input">Nenhum ônibus encontrado...</h2>
          </form>
        )}
        <div ref="map" className="mapStyle">
          Loading map...
        </div>
        {this.renderChildren()}
      </div>
    );
  }
}
export default CurrentLocation;

CurrentLocation.defaultProps = {
  zoom: 17,
  initialCenter: {
    lat: '',
    lng: ''
  },
  centerAroundCurrentLocation: false,
  visible: true
};
