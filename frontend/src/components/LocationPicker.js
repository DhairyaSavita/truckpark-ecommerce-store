import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import { MapPinIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px'
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
};

const LocationPicker = ({ onLocationSelect, initialAddress = '' }) => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(false);
  const autocompleteRef = useRef(null);
  
  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setMarker(location);
        setAddress(place.formatted_address);
        map?.panTo(location);
        map?.setZoom(15);
        
        onLocationSelect({
          address: place.formatted_address,
          lat: location.lat,
          lng: location.lng,
          place_id: place.place_id
        });
      }
    }
  };

  const onMapClick = useCallback((event) => {
    const location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    setMarker(location);
    getAddressFromLatLng(location.lat, location.lng);
  }, []);

  const getAddressFromLatLng = async (lat, lng) => {
    setLoading(true);
    try {
      // Using Google Maps Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapsApiKey}`
      );
      const data = await response.json();
      if (data.results && data.results[0]) {
        const formattedAddress = data.results[0].formatted_address;
        setAddress(formattedAddress);
        onLocationSelect({
          address: formattedAddress,
          lat: lat,
          lng: lng,
          place_id: data.results[0].place_id
        });
      }
    } catch (error) {
      console.error('Error getting address:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setMarker(location);
          map?.panTo(location);
          map?.setZoom(15);
          getAddressFromLatLng(location.lat, location.lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enter address manually.');
          setLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
      setLoading(false);
    }
  };

  if (!googleMapsApiKey) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Google Maps API key not configured. Please add REACT_APP_GOOGLE_MAPS_API_KEY to .env file.</p>
        <input
          type="text"
          placeholder="Enter your address manually"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            onLocationSelect({ address: e.target.value });
          }}
          className="mt-2 w-full border rounded px-3 py-2"
        />
      </div>
    );
  }

  return (
    <LoadScript 
      googleMapsApiKey={googleMapsApiKey}
      libraries={['places']}
    >
      <div className="space-y-3">
        {/* Address Search */}
        <div className="relative">
          <Autocomplete
            onLoad={(ref) => (autocompleteRef.current = ref)}
            onPlaceChanged={onPlaceChanged}
            restrictions={{ country: ['in'] }}
          >
            <input
              type="text"
              placeholder="Search for your location..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Autocomplete>
          <button
            type="button"
            onClick={getCurrentLocation}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-blue-600"
            title="Use my current location"
          >
            <GlobeAltIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Map */}
        <div className="relative">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={marker || defaultCenter}
            zoom={marker ? 15 : 5}
            onClick={onMapClick}
            onLoad={onLoad}
          >
            {marker && <Marker position={marker} />}
          </GoogleMap>
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="text-gray-600">Loading location...</div>
            </div>
          )}
        </div>

        {/* Location Info */}
        {address && (
          <div className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
            <MapPinIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Selected Location</p>
              <p className="text-xs text-gray-600">{address}</p>
            </div>
          </div>
        )}
      </div>
    </LoadScript>
  );
};

export default LocationPicker;
