import {useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Popup, useMapEvents, ZoomControl } from "react-leaflet";
import { Layer, LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles/Map.css";
import buildingsData from "./data/temp4.json";
import { Feature, Geometry } from "geojson";
import BuildingPopup from "./BuildingPopup";

interface BuildingProperties {
	BUILDINGNAME: string;
	ADDRESS: string;
}

// term numbers start from 2048 (Fall 2004)
// terms increment by 2 from fall -> winter -> spring -> summer
// however, summer -> fall increments by 4
// 2260
// first number is the millenium
// next two numbers are the year (26 = 2026)
// last number is 8, 0, 2, or 4 (fall, winter, spring, summer, respectively)
const quarterNumToSeason: Record<number, string> = {
	8: "Fall",
	0: "Winter",
	2: "Spring",
	4: "Summer"
}
function termToString(term: number) {
	const quarter = term % 10;
	const year = 2000 + (((term - (term % 10)) / 10) - 200);

	return `${quarterNumToSeason[quarter]} ${year}`;
}

// todo: fetch this from the backend
function getAllTerms() {
	const terms = [2048];
	const years = Array.from({ length: (new Date().getFullYear() - 2000) - 5 + 1 }, (_, i) => i + 5);
	years.forEach(year => {
		terms.push(
			2000 + (year * 10) + 0,
			2000 + (year * 10) + 2,
			2000 + (year * 10) + 4,
			2000 + (year * 10) + 8,
		)
	});

	terms.reverse();
	return terms.filter(y => y <= 2260);
}

// Component to handle map clicks
function MapClickHandler() {
	useMapEvents({
		click: (e) => {
			console.log([e.latlng.lng, e.latlng.lat]);
		}
	});
	return null;
}

export default function Map() {
	const [selectedFeature, setSelectedFeature] = useState<Feature<Geometry, BuildingProperties> | null>(null);
	const [popupPosition, setPopupPosition] = useState<LatLng | null>(null);
	const [selectedTerm, setSelectedTerm] = useState<number>(2260);

	const bounds: [[number, number], [number, number]] = [
		[36.9750, -122.0750],
		[37.0050, -122.0450]
	];

	const onEachFeature = (feature: Feature<Geometry, BuildingProperties>, layer: Layer) => {
		layer.on('click', (e) => {
			console.log([e.latlng.lng, e.latlng.lat]);
			setSelectedFeature(feature);
			setPopupPosition(e.latlng);
		});
	};

	return (
		<>
			<div style={{
				position: 'fixed',
				top: '70px',
				right: '20px',
				zIndex: 1000,
			}}>
				<select
					value={selectedTerm}
					onChange={(e) => setSelectedTerm(Number(e.target.value))}
					style={{
						padding: '8px 12px',
						backgroundColor: 'var(--card-bg)',
						color: 'var(--gold)',
						border: '1px solid rgba(255, 255, 255, 0.1)',
						borderRadius: '8px',
						fontSize: '14px',
						fontWeight: '500',
						cursor: 'pointer',
						boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
					}}
				>
					{getAllTerms().map(term => (
						<option key={term} value={term}>{termToString(term)}</option>
					))}
				</select>
			</div>
			<MapContainer
				center={[36.9914, -122.0609]}
				zoom={15}
				maxBounds={bounds}
				maxBoundsViscosity={1.0}
				minZoom={15}
				maxZoom={30}
				zoomControl={false}
				style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}
			>
			<ZoomControl position="bottomright" />
			<TileLayer
				url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
				attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
				subdomains="abcd"
				maxZoom={30}
			/>
			<GeoJSON
				data={buildingsData as GeoJSON.GeoJsonObject}
				style={{
					color: '#3388ff',
					weight: 2,
					opacity: 0.8,
					fillOpacity: 0.3
				}}
				onEachFeature={onEachFeature}
			/>
			{selectedFeature && popupPosition && (
				<Popup
					position={popupPosition}
					eventHandlers={{
						remove: () => setSelectedFeature(null)
					}}
				>
					<BuildingPopup
						locationName={selectedFeature.properties.BUILDINGNAME}
						locationAddress={selectedFeature.properties.ADDRESS}
						term={selectedTerm}
					/>
				</Popup>
			)}
			<MapClickHandler />
		</MapContainer>
		</>
	);
}