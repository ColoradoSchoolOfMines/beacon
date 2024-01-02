/**
 * @file Geography map component
 */

import "leaflet/dist/leaflet.css";
import "leaflet";

import {Map as LeafletMap} from "leaflet";
import {useEffect, useRef} from "react";
import {
  AttributionControl,
  MapContainer,
  MapContainerProps,
  ScaleControl,
  TileLayer,
} from "react-leaflet";
import {useMeasure} from "react-use";

import styles from "~/components/Map.module.css";
import {useStore} from "~/lib/state";
import {Theme} from "~/lib/types";

/**
 * Geography map component props
 */
interface MapProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Position (latitude, longitude)
   */
  position: [number, number];

  /**
   * Whether or not to lock the position
   */
  lockPosition?: boolean;

  /**
   * Zoom level (0-20)
   */
  zoom?: number;

  /**
   * Whether or not to lock the zoom level
   */
  lockZoom?: boolean;

  /**
   * Minimum zoom level (0-20)
   */
  minZoom?: number;

  /**
   * Maximum zoom level (0-20)
   */
  maxZoom?: number;
}

/**
 * Geography map component
 * @returns JSX
 */
export const Map: React.FC<MapProps> = ({
  position,
  lockPosition = false,
  zoom = 10,
  lockZoom = false,
  minZoom,
  maxZoom,
  ...props
}) => {
  // Hooks
  const mapRef = useRef<MapContainerProps & LeafletMap>(null);
  const theme = useStore(state => state.theme);
  const [container, {height, width}] = useMeasure<HTMLDivElement>();

  // Effects
  useEffect(() => {
    if (mapRef.current === null) {
      return;
    }

    mapRef.current.invalidateSize();
  }, [height, width]);

  return (
    <div
      {...props}
      className={`${styles.container} ${props.className ?? ""}`}
      ref={container}
    >
      <MapContainer
        className="h-full w-full !bg-white dark:!bg-black"
        ref={mapRef}
        attributionControl={false}
        center={position}
        doubleClickZoom={!lockZoom}
        dragging={!lockPosition}
        maxBounds={[position, position]}
        maxZoom={maxZoom}
        minZoom={minZoom}
        scrollWheelZoom={!lockZoom}
        zoom={zoom}
        zoomControl={!lockZoom}
      >
        <ScaleControl />
        <AttributionControl prefix="" />
        <TileLayer
          className={
            theme === Theme.DARK ? "invert grayscale-30 hue-rotate-180" : ""
          }
          attribution='<a rel="noreferrer" target="_blank" href="https://leafletjs.com/">Leaflet</a> | &copy; <a rel="noreferrer" target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a rel="noreferrer" target="_blank" href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
      </MapContainer>
    </div>
  );
};
