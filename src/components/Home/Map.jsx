import React, { useState } from 'react';
import {
  Map,
  useMap,
  useMapsLibrary,
  Marker,
  InfoWindow,
  AdvancedMarker,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';

export default function CutomMap(props) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const { device, movements, range, showModal } = props;
  const [markerInfo, setMarkerInfo] = useState(false);
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

  const markerClicked = (e) => {
    setMarkerInfo(true);
  };
  const handleClose = () => {
    setMarkerInfo(false);
  };
  return (
    <>
      <Map
        className={'col col-12 col-md-9 map-col'}
        defaultCenter={markerPosition}
        defaultZoom={18}
        gestureHandling={'greedy'}
        disableDefaultUI={false}
        mapId="4504f8b37365c3d0"
      >
        <AdvancedMarker
          position={markerPosition}
          ref={markerRef}
          //label={{ text: `${markerLabel}`, color: 'white' }}
          title={`${markerLabel}`}
          onClick={(e) => markerClicked(e)}
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
            onClick={(e) => markerClicked(e)}
          />
        </AdvancedMarker>
        {markerInfo && (
          <InfoWindow anchor={marker} onClose={() => handleClose()}>
            <div class="row">
              <div class="form search-form inputs-underline">
                <div class="section-title">
                  <h5>{device?.device?.bike?.name}</h5>
                </div>
                <hr />

                <div class="row">
                  <div class="col-md-6 col-sm-6">端末状態：</div>
                  <div class="col-md-6 col-sm-6">
                    <p
                      style={{ width: '100%' }}
                      class={`btn mb-0 ${
                        device?.deviceStatus === '要確認'
                          ? 'btn-outline-danger'
                          : 'btn-outline-primary'
                      }`}
                    >
                      {device?.deviceStatus}
                    </p>
                  </div>
                </div>
                <hr />
                <div class="row">
                  <div class="col-md-6 col-sm-6">バッテリー：</div>
                  <div class="col-md-6 col-sm-6">
                    <span>{device?.lastLocation?.bat}</span>
                  </div>
                </div>
                <hr />
                <div class={`row ${!device?.monitoringActive ? 'mb-3' : ''}`}>
                  <div class="col-md-6 col-sm-6">監視モード：</div>
                  <div class="col-md-6 col-sm-6">
                    <button
                      style={{ width: '100%' }}
                      onClick={(event) => showModal(event)}
                      class={`btn ${
                        device?.monitoringActive
                          ? 'btn-outline-primary'
                          : 'btn-primary'
                      }`}
                    >
                      {device?.monitoringActive ? '監視中' : '解除中'}
                    </button>
                  </div>
                </div>
                {device?.monitoringActive && (
                  <>
                    <hr />
                    <div class="row mb-3">
                      <div class="col-md-6 col-sm-6">監視半径：</div>
                      <div class="col-md-6 col-sm-6">
                        <span>{`${device?.monitoringSettings?.range}m`}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>
    </>
  );
}
