import React from 'react';
import {
  Map,
  useMap,
  useMapsLibrary,
  Marker,
  AdvancedMarker,
  Pin,
} from '@vis.gl/react-google-maps';

export default function CutomMap(props) {
  const { device, movements } = props;
  const map = useMap();
  const maps = useMapsLibrary('maps');
  const position = { lat: 0, lng: -180 };
  let label = device?.device?.bike?.name;
  const markerLabel =
    label.length > 2
      ? label
          .split(/\s/)
          .reduce((response, word) => (response += word.slice(0, 1)), '')
      : label;
  const markerPosition = {
    lat: device.lastLocation.lat,
    lng: device.lastLocation.lon,
  };

  if (!maps) {
    return null;
  }
  const devicePlanCoordinates = movements.map((movement) => {
    return { lat: movement.lat, lng: movement.lon };
  });
  const devicePath = new maps.Polyline({
    path: devicePlanCoordinates,
    geodesic: true,
    strokeColor: '#000000',
    strokeOpacity: 1.0,
    strokeWeight: 2,
  });

  devicePath.setMap(map);

  return (
    <Map
      className={'col col-12 col-md-9 map-col'}
      defaultCenter={markerPosition}
      defaultZoom={12}
      gestureHandling={'greedy'}
      disableDefaultUI={false}
    >
      <Marker
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#4611a7',
          fillOpacity: 1,
          scale: 20,
          strokeColor: 'white',
          strokeWeight: 0,
        }}
        position={{ lat: markerPosition?.lat, lng: markerPosition?.lng }}
        label={{ text: `${markerLabel}`, color: 'white' }}
      ></Marker>
    </Map>
  );
}
