import React from 'react';
import { Map, useMap, useMapsLibrary, Marker } from '@vis.gl/react-google-maps';

export default function CutomMap(props) {
  const { device, movements, range } = props;
  const map = useMap();
  const maps = useMapsLibrary('maps');

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

  let geofence_Latlng = new google.maps.LatLng(
    markerPosition?.lat,
    markerPosition?.lng
  );
  devicePath.setMap(map);
  const circle = new maps.Circle({
    radius: device?.monitoringSettings?.range,
    center: geofence_Latlng,
    strokeColor: '#4611a7',
    fillColor: '#4611a7',
    fillOpacity: 0.2,
    strokeWeight: 3,
  });
  circle.setMap(map);
  return (
    <Map
      className={'col col-12 col-md-9 map-col'}
      defaultCenter={markerPosition}
      defaultZoom={18}
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
          anchor: google.maps.Point(16, 55), //マーカーの表示位置を25pxだけ上に
          zIndex: 1000,
        }}
        position={markerPosition}
        label={{ text: `${markerLabel}`, color: 'white' }}
      />
    </Map>
  );
}
