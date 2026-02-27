import csvParser from 'csv-parser';
import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();
const csvPath = path.join(__dirname, "/src/seeds/utils/location.csv");

export const generateRandomCoordinates = () => {
	const parisLatitude = 48.8566;
	const parisLongitude = 2.3522;
	const radiusInKm = 100;
  
	// convertir les km en degrés de latitude et longitude approximatifs
	const latDegree = 1 / 111.32; // 1 degré de latitude ≈ 111.32 km
	const lonDegree = 1 / (111.32 * Math.cos(parisLatitude * Math.PI / 180));
  
	// générer un angle aléatoire dans un cercle de rayon donné
	const randomAngle = Math.random() * 2 * Math.PI;
	const randomDistance = Math.random() * radiusInKm;
  
	// Cclculer la variation en latitude et longitude
	const deltaLat = randomDistance * latDegree;
	const deltaLon = randomDistance * lonDegree;
  
	const newLatitude = parisLatitude + deltaLat * Math.sin(randomAngle);
	const newLongitude = parisLongitude + deltaLon * Math.cos(randomAngle);
  
	return { latitude: newLatitude, longitude: newLongitude };
};

export const loadLocations = () => {
    return new Promise((resolve, reject) => {
        const locations = [];
        fs.createReadStream(csvPath)
            .pipe(csvParser())
            .on('data', (row) => {
                // chaque ligne du CSV est un objet avec des clés 'latitude', 'longitude', 'city', 'loc'
                if (row && row.latitude && row.longitude && row.city && row.loc) {
                    locations.push({
                        latitude: parseFloat(row.latitude),
                        longitude: parseFloat(row.longitude),
                        city: row.city,
                        loc: JSON.parse(row.loc) // en fait un réel objet JSON exploitable
                    });
                }
            })
            .on('end', () => {
                resolve(locations); // si tout est ok, rend la promesse
            })
            .on('error', reject); // si erreur, pas de promesse rendue
    });
};

export const getCityFromCoords = async (latitude, longitude) => {
    const apiKey = process.env.OPENCAGE_API_KEY;
    let city;
    let loc;
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}&language=fr&no_annotations=1`;
    try {
        const cityRes = await fetch(url);
        if (!cityRes.ok && cityRes.status != 402) {
            throw new Error(`HTTP error! Status: ${cityRes.status}`);
        }
        if (cityRes.status == 402) {
            city = "Plus-de-credits-city";
            loc = null;
        }
        else {
            const data = await cityRes.json();
            loc = data.results[0];
            city = loc?.components.city || 
                loc?.components.town ||
                loc?._normalized_city ||
                loc?.components.village || 
                loc?.components.county || 
                loc?.components.state || 
                loc?.components.municipality || 
                loc?.components.shipping_forecast_sea_area || 
                loc?.components.body_of_water ||
                "Inconnue";
        }
        return {city, loc};
        } catch (error) {
            return "Inconnue3";
        }
};