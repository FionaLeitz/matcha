import { createTag, createUsersTags, createUser, addImagesToUser, updateUserProfile, updateUserCity, updateUserVerification, updateUserLocation } from "../models/dbQueries.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { generateLinkToImage, generateImages } from "./utils/imagesUtils.js";
import { loadLocations } from "./utils/locationsUtils.js";
import { generateUsernames, generateBio } from "./utils/usersUtils.js";

dotenv.config();

const n = process.argv[2] ? parseInt(process.argv[2], 10) : 20; // par défaut, générer 20 users si l'argument est absent

const maleNames = [
    "James",
    "John",
    "Robert",
    "Michael",
    "William",
    "David",
    "Richard",
    "Joseph",
    "Thomas"
];

const femaleNames = [
	"Mary",
	"Patricia",
	"Jennifer",
	"Linda",
	"Elizabeth",
	"Barbara",
	"Susan",
	"Jessica",
	"Sarah",
	"Karen",
	"Nancy",
	"Lisa",
];

const lastNames = [
    "Smith",
    "Jones",
    "Williams",
    "Taylor",
    "Brown",
    "Davies",
    "Evans",
    "Wilson",
    "Thomas",
    "Johnson",
    "Roberts",
    "Robinson",
    "Thompson",
    "Wright",
    "Walker",
    "White",
    "Edwards",
    "Hughes",
    "green",
    "Hall",
    "Lewis",
    "Harris",
    "Clarke",
    "Patel",
    "Jackson",
    "Wood",
    "Turner",
    "Martin",
    "Cooper",
    "Hill",
    "Ward",
    "Morris",
    "Moore",
    "Clark",
    "Lee",
    "King",
    "Baker",
    "Harrison",
    "Morgan",
    "Allen",
    "James",
    "Scott",
    "Phillips",
    "Watson",
    "Davis",
    "Parker",
    "Price",
    "Bennett",
    "Young",
    "Griffiths"
]

const genderPreferences = ["male", "female", "both"];

const locations = await loadLocations();

const images = await generateImages(n);

const generateRandomUser = async (gender) => {
	const names = gender === "male" ? maleNames : femaleNames;
	const first_name = names[Math.floor(Math.random() * names.length)];
    const last_name = lastNames[Math.floor(Math.random() * lastNames.length)];
    const username = await generateUsernames();
	const age = Math.floor(Math.random() * (45 - 21 + 1) + 21);
	let birthday = new Date();
	birthday.setFullYear(birthday.getFullYear() - age);
    const tags = generateBio();

    // nouvelle methode : pioche une localisation au hasard dans le tableau des coordonnées
    const location = locations[Math.floor(Math.random() * locations.length)];

    const { latitude, longitude, city, loc } = location;

    const image = Math.floor(Math.random() * 12) + 1;
	return {
		userId: 0,
		first_name,
        last_name,
        username,
		email: `${username.toLowerCase()}@example.com`,
		password: "password123",
		birthday,
		gender,
		gender_preference: genderPreferences[Math.floor(Math.random() * genderPreferences.length)],
        bio: "Hello I am happy to meet you and I am a #" + tags[0],
        tags: tags,
		image: await generateLinkToImage(`/${gender}/${image}.jpg`),
		latitude,
		longitude,
        city, // avec la nouvelle methode
        loc   // avec la nouvelle methode
	};
};

const seedUsers = async () => {
	try {
        let i = 0;
        let user;
        if (locations.length === 0) {
            throw new Error("Le fichier CSV de localisation est vide ou non chargé.");
        }
        while(i < n)
        {   
            if (i % 2 == 0)
                user = await generateRandomUser("male");
            else
                user = await generateRandomUser("female");
            if (user)
            {
                user.password = await bcrypt.hash(user.password, 10);
                const userCreated = await createUser(
                    user.first_name,
                    user.last_name,
                    user.username,
                    user.email,
                    user.password,
                    user.birthday,
                    user.gender,
                    user.gender_preference,
                );
                userCreated.bio = user.bio;
                userCreated.image = user.image;
                
                await updateUserProfile({
                    userId: userCreated.id,
                    ...userCreated});
                
                userCreated.latitude = user.latitude;
                userCreated.longitude = user.longitude;
                await updateUserLocation(userCreated.id, {latitude: userCreated.latitude, longitude: userCreated.longitude}, true);

                userCreated.images = [
                    images['travel'][i],
                    images['pet'][i],
                    images['hobby'][i],
                    images['friends'][i],
                ];
                await addImagesToUser(userCreated.id, userCreated.images);

                userCreated.city = user.city;
                userCreated.loc = user.loc;
                await updateUserCity(userCreated.id, userCreated.city, userCreated.loc);

                const tags = user.tags;
                let j = 0;
                while (j < 3) {
                    await createTag(tags[j]);
                    await createUsersTags(userCreated.id, tags[j]);
                    j++;
                }

                await updateUserVerification(userCreated.id, true);
            }
            i++;
        }

        console.log("Database seeded successfully with users having concise bios");
	} catch (error) {
		console.error("Error seeding database:", error);
	}

};

seedUsers();
