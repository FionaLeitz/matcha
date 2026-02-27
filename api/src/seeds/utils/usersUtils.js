import { findUserByUsername } from "../../models/dbQueries.js";

const adjectives = [
    "Murky",
    "Boiling",
    "Enthusiastic",
    "Guttural",
    "Unkempt",
    "Breakable",
    "Disgusted",
    "Absurd",
    "Abounding",
    "Towering",
    "Tested",
    "Famous",
    "Rampant",
    "Toothsome",
    "Eastern",
    "Clammy",
    "Aboriginal",
    "Sick",
    "Worthless",
    "Electronic",
    "Boundless",
    "Noiseless",
    "Black",
    "Skillful",
    "Obscene",
    "Entire",
    "Imminent",
    "Abrupt",
    "Adhesive",
    "Giant"
]

const nouns = [
    "Presentation",
    "King",
    "Investment",
    "Advice",
    "Moment",
    "Information",
    "Satisfaction",
    "Reception",
    "Employee",
    "Cigarette",
    "Difference",
    "Engineering",
    "President",
    "Sir",
    "Difficulty",
    "Highway",
    "Country",
    "Baseball",
    "Television",
    "Environment",
    "Region",
    "System",
    "Sympathy",
    "Farmer",
    "Attention",
    "Assumption",
    "Medicine",
    "Version",
    "Marketing",
    "Preparation"
]

const bioDescriptors = [
	"CoffeeAddict",
	"CatLover",
	"DogPerson",
	"Foodie",
	"GymRat",
	"Bookworm",
	"MovieBuff",
	"MusicLover",
	"TravelJunkie",
	"BeachBum",
	"CitySlicker",
	"OutdoorEnthusiast",
	"NetflixBinger",
	"YogaEnthusiast",
	"CraftBeerConnoisseur",
	"SushiFanatic",
	"AdventureSeeker",
	"NightOwl",
	"EarlyBird",
	"AspiringChef",
];

export const generateUsernames = async () => {
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomLastName = nouns[Math.floor(Math.random() * nouns.length)];

    let username = `${randomAdjective}${randomLastName}`;
        
    // si le username est déjà pris, on ajoute un chiffre à la fin
    let count = 1;
    while (await findUserByUsername(username)) {
        username = `${randomAdjective}${randomLastName}${count}`;
        count++;
    }
    return username;
};

export const generateBio = () => {
	const descriptors = bioDescriptors.sort(() => 0.5 - Math.random()).slice(0, 3);
	return descriptors;
};