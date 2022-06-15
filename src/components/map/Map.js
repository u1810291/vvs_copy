import React, {useCallback, useRef} from "react";
import {GoogleMap, useLoadScript} from "@react-google-maps/api";
import useLanguage from "../../hook/useLanguage";
import GoogleMapTools from "./googleMapTools";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const mapCenter = {
  lat: 55.95,
  lng: 23.33,
};

const Map = ({isMapTools, mapToolsLibraries}) => {
  const {t} = useLanguage();
  const mapRef = useRef(null);

  const onMapLoad = useCallback(function callback(map) {
    mapRef.current = map;
  }, []);

  const onMapUnmount = useCallback(function callback(map) {
    mapRef.current = null;
  }, []);

  const {isLoaded : isMapLoaded} = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
    libraries: mapToolsLibraries
  });

  return isMapLoaded ? (
    <div className="w-full h-full relative">
      <GoogleMap
        zoom={14}
        center={mapCenter}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
        mapContainerStyle={mapContainerStyle}
      >
        {isMapTools && <GoogleMapTools onMapLoad={onMapLoad}/>}
      </GoogleMap>
    </div>
  ) : <></>
};

export default Map;