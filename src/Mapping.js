/*global google*/
import React, { useEffect } from "react";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import Search from "./Searching";

let service;
const libraries = ["hospital"];

const mapContainerStyle = {
    height: "100vh",
    width: "100vw"
};
const options = {
    disableDefaultUI: true,
    zoomControl: true
};

export default function App() {
    let center = {
        lat: 42.38884,
        lng: -72.52985
    };
    useEffect(() =>
        navigator.geolocation.getCurrentPosition(function (position) {
            center.lat = position.coords.latitude;
            center.lng = position.coords.longitude;
        })
    );
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: "AIzaSyA8iORrzrgPiiGQf53qPs50AFet8CzZjhM",
        libraries
    });
    const mapRef = React.useRef();
    const onMapLoad = React.useCallback(map => {
        mapRef.current = map;
    }, []);

    const panTo = React.useCallback(({ lat, lng }) => {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(12);
        let map = mapRef.current;

        let request = {
            location: { lat, lng },
            radius: "50000",
            type: ["Hospital"]
        };

        service = new google.maps.places.PlacesService(mapRef.current);
        service.nearbySearch(request, callback);
        function callback(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (let i = 0; i < results.length; i++) {
                    let place = results[i];
                    new google.maps.Marker({
                        position: place.geometry.location,
                        map
                    });
                }
            }
        }
    }, []);

    return (
        <div>
            <Search panTo={panTo} />
            <GoogleMap
                id="map"
                mapContainerStyle={mapContainerStyle}
                zoom={8}
                center={center}
                options={options}
                onLoad={onMapLoad}
            />
        </div>
    );
}