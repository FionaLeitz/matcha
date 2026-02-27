import fs from 'fs';
import path from 'path';
import cloudinary from "../../config/cloudinary.js";

const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
const __dirname = path.resolve();

export const generateImageAsBase64 = (imagePath) => {
    const filePath = path.join(__dirname, "/public", imagePath);
    const file = fs.readFileSync(filePath);
    return `data:image/jpeg;base64,${file.toString('base64')}`;
};

export const generateLinkToImage = async (imagePath) => {
    const imageBase64 = generateImageAsBase64(imagePath);
    try {
        const uploadResponse = await cloudinary.uploader.upload(imageBase64);
        return uploadResponse.secure_url
    } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        // throw new Error("Error uploading image");
        return null;
    }
};

export const fetchImagesByCategory = async (category, n) => {
    try {
        const response = await fetch(`https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${category}&image_type=photo&per_page=${n}`);
        
        if (!response.ok) {
            throw new Error(`Error getting image from pixabay for ${category}`);
        }

        const data = await response.json();
        if (data.hits.length > 0) {
            return data.hits.map(hit => hit.largeImageURL);
        } else {
            return [];
        }
    } catch (error) {
        console.error('Erreur Pixabay:', error);
        return [];
    }
};

export const generateImages = async (n) => {
    const categories = ['travel', 'pet', 'hobby', 'friends'];
    const images = {};
    let i;

    if (n > 25)
        i = 25;
    else if (n < 3)
        i = 3;
    else
        i = n;
    for (const category of categories) {
        const categoryImages = await fetchImagesByCategory(category, i);
        images[category] = categoryImages.length > 0 ? categoryImages : ['/image_not_found.jpg'];  // Fallback en cas de probleme
    }

    return images;  // retourne un objet avec un tableau d'images par categorie
};