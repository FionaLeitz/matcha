import pool from './pool.js';
import { readFile } from 'fs/promises';

const MAX_RETRIES = 10;

// sleeps function, used to wait for the db to work
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const isDatabaseReady = async () => {
    try {
        const client = await pool.connect();
        await client.query('SELECT 1'); // eq ping
        client.release();
        return true;
    } catch (error) {
        return false;
    }
};

// creates script to instanciate database tables
const createScriptFromFile = async (path) => {
    try {
        const script = await readFile(path, 'utf-8');
        return script;
    } catch (error) {
        throw error;
    }
};

// lanches script to instanciate database tables with pool
const createTableInDB = async (path, pool) => {
    const script = await createScriptFromFile(path);
    await pool.query(script);
};

export const connectDB = async () => {
    let retries = 0;
	try {
        while (retries < MAX_RETRIES)
        {
            const ready = await isDatabaseReady()
            if (ready)
                break;
            else {
                console.log("Waiting for db...");
                retries++;
                await sleep(1000);
            }
        }

		const db = await pool.connect();
		console.log("PostgreSQL Connected");

        await createTableInDB("/app/src/models/UsersTable.sql", pool);
        await createTableInDB("/app/src/models/MatchesTable.sql", pool);
        await createTableInDB("/app/src/models/ChatsTable.sql", pool);
        await createTableInDB("/app/src/models/MessagesTable.sql", pool);
        await createTableInDB("/app/src/models/TagsTable.sql", pool);
        await createTableInDB("/app/src/models/UsersTagsTable.sql", pool);
        await createTableInDB("/app/src/models/ViewsTable.sql", pool);
        await createTableInDB("/app/src/models/NotificationTable.sql", pool);

		return pool;
	} catch (error) {
		console.error("Error connecting to PostgreSQL: ", error);
        console.error("Tried", retries, "times.");
		process.exit(1);
	}
};
