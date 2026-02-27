import pool from '../config/pool.js';

/*
  USERS
*/

// creates new user in database
// 'INSERT INTO users' adds a new entry in the users table
// with value name = $1, email = $2, ...
// $1 being name parameter, $2 email parameter, ...
// and it returns what it created
export const createUser = async (first_name, last_name, username, email, password, birthday, gender) => {
    const result = await pool.query(
        `INSERT INTO users (first_name, last_name, username, email, password, birthday, gender)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [first_name, last_name, username, email, password, birthday, gender]
    );
    return result.rows[0];
};

// get user by email
// get every entry in users table that has email = the email parameter
// but no one can have the same email
// returns the entire user
export const findUser = async (email) => {
    const result = await pool.query(
        `SELECT * , DATE_PART('year', AGE(birthday)) AS age
         FROM users WHERE email = $1`,
        [email]
    );
    return result.rows[0];
};

//same for username
// (6371 * acos(
// 	cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) +
// 	sin(radians($1)) * sin(radians(latitude))
// )) AS distance
export const findUserByUsername = async (username, latitude, longitude) => {
    const result = await pool.query(
        `SELECT * ,
			DATE_PART('year', AGE(birthday)) AS age,
			(6371 * acos(
					cos(radians($2)) * cos(radians(latitude)) * cos(radians(longitude) - radians($3)) +
					sin(radians($2)) * sin(radians(latitude))
				)) AS distance
         FROM users WHERE username = $1`,
        [username,
		 latitude,
		 longitude]
    );
    return result.rows[0];
};

// get user by id
// get every entry in users table that has id = the id parameter
// but no one can have the same id
// returns the entire user
export const findUserById = async (id) => {
    const result = await pool.query(
        `SELECT * , DATE_PART('year', AGE(birthday)) AS age
         FROM users WHERE id = $1`,
        [id]
    );
    return result.rows[0];
};

export const findUserByToken = async (token) => {
	const result = await pool.query(
        `SELECT * , DATE_PART('year', AGE(birthday)) AS age
         FROM users 
         WHERE reset_password_token = $1
          AND reset_password_expires > NOW()`,
        [token]
    );
    return result.rows[0];
};

export const findUserByEmailChangeToken = async (token) => {
	const result = await pool.query(
        `SELECT * , DATE_PART('year', AGE(birthday)) AS age
         FROM users
         WHERE email_change_token = $1
          AND email_change_expires > NOW()`,
        [token]
    );
    return result.rows[0];
};

// updates the user profile
// changes every values in the user with the ones in the updatedUser
// for the entry with $1 as updatedUser.userId
// then returns this user
export const updateUserProfile = async (updatedUser) => {
	const result = await pool.query(
		`UPDATE users
		 SET first_name = $2,
             last_name = $3,
             username = $4,
			 gender = $5,
			 gender_preference = $6,
			 bio = $7,
			 images = CASE
				WHEN array_length(images, 1) IS NULL AND $8 <> '' THEN array_append(ARRAY[]::VARCHAR(255)[], $8)
				WHEN array_length(images, 1) < 5 AND $8 <> '' THEN array_append(images, $8)
				ELSE images
			 END,
			 image = CASE
			 	WHEN image IS NULL OR image = '' THEN $8
				ELSE image
			 END,
			 updated_at = CURRENT_TIMESTAMP
		 WHERE id = $1
		 RETURNING *`,
		[
			updatedUser.userId,
			updatedUser.first_name,
            updatedUser.last_name,
            updatedUser.username,
			updatedUser.gender,
			updatedUser.gender_preference,
			updatedUser.bio,
			updatedUser.image]
	);
	
	if (result.rows.length === 0) {
        throw new Error("Update failed");
    }

	return result.rows[0];
};

export const deletePictureFromUser = async (image, userId) => {
	const result = await pool.query(
		`UPDATE users
		 SET images = array_remove(images, $1),
		 	 image = CASE
			 	WHEN $1 = image THEN
					CASE
						WHEN array_length(array_remove(images, $1), 1) IS NULL THEN NULL
						ELSE (array_remove(images, $1))[1]
					END
				ELSE image
			 END
		 WHERE id = $2
		 RETURNING *`,
		[image, userId]
	);

	if (result.rows.length === 0) {
		throw new Error("Delete picture failed");
	}

	return result.rows[0];
};

export const setProfilePicture = async (image, userId) => {
	const result = await pool.query(
		`UPDATE users
		 SET image = $1
		 WHERE id = $2
		 RETURNING *`,
		[image, userId]
	);

	if (result.rows.length === 0) {
		throw new Error("Set profile picture failed");
	}

	return result.rows[0];
};

export const addReportProfile = async (reported_id, reporter_id) => {
	const result = await pool.query(
		`UPDATE users
		 SET reported_by = array_append(reported_by, $2)
		 WHERE id = $1
		 RETURNING *`,
		[reported_id, reporter_id]
	);

	return result.rows[0];
}
export const addImagesToUser = async (userId, newImages) => {
    const result = await pool.query(
        `WITH current_images AS (
            SELECT images
            FROM users
            WHERE id = $1
         ),
         updated_images AS (
            SELECT 
                CASE
                    WHEN array_length(images, 1) IS NULL THEN $2
                    ELSE array_cat(images, $2)
                END AS images
            FROM current_images
         )
         UPDATE users
         SET images = (
                SELECT images
                FROM updated_images
                WHERE array_length(images, 1) <= 5
         )
         WHERE id = $1
         RETURNING *`,
        [userId, newImages]
    );

    return result.rows[0];
};

export const pendingEmail = async (newEmail, token, exp, userId) => {
	const result = await pool.query(
		`UPDATE users SET pending_email = $1,
		 email_change_token = $2,
		 email_change_expires = to_timestamp($3)
		 WHERE id = $4
		 RETURNING *`,
        [newEmail, token, exp, userId]
	);

	return result.rows[0];
};

export const updateLastConnection = async (userId) => {
	const result = await pool.query(
		`UPDATE users
		 SET last_connection = CURRENT_TIMESTAMP
		 WHERE id = $1
		 RETURNING *`,
		[userId]
	);

	return result.rows[0];
};

export const emptyDislikes = async (userId) => {
	await pool.query(
		`UPDATE users
		 SET dislikes = ARRAY[]::integer[]
		 WHERE id = $1`,
		[userId]
	);
};



/*
  MATCH
*/

export const updateUserBlocked = async (userId, blockedUserId) => {
	try {
		await pool.query('BEGIN');

		await pool.query(
			`UPDATE users
			 SET likes = array_remove(likes, $1)
			 WHERE id = $2`,
			[blockedUserId, userId]
		);

		const matchExists = await pool.query(
			`SELECT 1
			 FROM matches
			 WHERE (user1_id = $1 AND user2_id = $2)
				OR (user1_id = $2 AND user2_id = $1)`,
			[blockedUserId, userId]
		);

		if (matchExists.rows.length > 0) {
			await pool.query(
				`UPDATE users
				 SET match_nbr = match_nbr - 1
				 WHERE id IN ($1, $2)`,
				[blockedUserId, userId]
			);
		}

		await pool.query(
			`DELETE FROM matches
			 WHERE (user1_id = $1 AND user2_id = $2)
				OR (user1_id = $2 AND user2_id = $1)`,
			[blockedUserId, userId]
		);

		await pool.query(
			`UPDATE users
			 SET blocked = array_append(blocked, $1)
			 WHERE id = $2
			 AND NOT ($1 = ANY(blocked))`,
			[blockedUserId, userId]
		);

		await pool.query(`COMMIT`);
	} catch (error) {
		await pool.query(`ROLLBACK`);
        throw new Error("Update failed");
	}
};

export const updateUserUnblocked = async (userId, unblockedUserId) => {
	await pool.query(
		`UPDATE users
		 SET blocked = array_remove(blocked, $1)
		 WHERE id = $2`,
		[unblockedUserId, userId]
	);
};


// adds a liked user to the userId's list
// changes the likes value with the likes value + the new likedId
// removes liked user from dislikes tab
export const updateUserLikes = async (userId, likedUserId) => {
	try {
		await pool.query('BEGIN');

		await pool.query(
			`UPDATE users
			 SET likes = array_append(likes, $1)
			 WHERE id = $2
			 AND NOT ($1 = ANY(likes))`,
			[likedUserId, userId]
		);

		await pool.query(
			`UPDATE users
			 SET dislikes = array_remove(dislikes, $1)
			 WHERE id = $2`,
			[likedUserId, userId]
		);

		await pool.query(`COMMIT`);
	} catch (error) {
		await pool.query(`ROLLBACK`);
        throw new Error("Update failed");
	}
};

// adds a disliked user to the userId's list
// changes the dislikes value with the disliked value + the new dislikedId
// removes disliked user from likes tab
// deletes match if exists
export const updateUserDislikes = async (userId, dislikedUserId) => {
	try {
		await pool.query('BEGIN');

		await pool.query(
			`UPDATE users
			 SET dislikes = array_append(dislikes, $1)
			 WHERE id = $2
			 AND NOT ($1 = ANY(dislikes))`,
			[dislikedUserId, userId]
		);

		await pool.query(
			`UPDATE users
			 SET likes = array_remove(likes, $1)
			 WHERE id = $2`,
			[dislikedUserId, userId]
		);

		const matchExists = await pool.query(
			`SELECT 1
			 FROM matches
			 WHERE (user1_id = $1 AND user2_id = $2)
				OR (user1_id = $2 AND user2_id = $1)`,
			[dislikedUserId, userId]
		);

		if (matchExists.rows.length > 0) {
			await pool.query(
				`UPDATE users
				 SET match_nbr = match_nbr - 1
				 WHERE id IN ($1, $2)`,
				[userId, dislikedUserId]
			);
		}

		await pool.query(
			`DELETE FROM matches
			 WHERE (user1_id = $1 AND user2_id = $2)
				OR (user1_id = $2 AND user2_id = $1)`,
			[dislikedUserId, userId]
		);

		await pool.query(`COMMIT`);
	} catch (error) {
		await pool.query(`ROLLBACK`);
        throw new Error("Update failed");
	}
};

export const unlikeUser = async (userId, unlikedUserId) => {
	try {
		await pool.query('BEGIN');

		await pool.query(
			`UPDATE users
			 SET likes = array_remove(likes, $1)
			 WHERE id = $2`,
			[unlikedUserId, userId]
		);

		const matchExists = await pool.query(
			`SELECT 1
			 FROM matches
			 WHERE (user1_id = $1 AND user2_id = $2)
				OR (user1_id = $2 AND user2_id = $1)`,
			[unlikedUserId, userId]
		);

		if (matchExists.rows.length > 0) {
			await pool.query(
				`UPDATE users
				 SET match_nbr = match_nbr - 1
				 WHERE id IN ($1, $2)`,
				[userId, unlikedUserId]
			);
		}

		await pool.query(
			`DELETE FROM matches
			 WHERE (user1_id = $1 AND user2_id = $2)
				OR (user1_id = $2 AND user2_id = $1)`,
			[unlikedUserId, userId]
		);

		await pool.query(`COMMIT`);
	} catch (error) {
		await pool.query(`ROLLBACK`);
        throw new Error("Update failed");
	}
};

// adds a match entry into the matches table
export const updateUserMatches = async (userId, matchedUserId) => {
	let result;
	try {
		await pool.query('BEGIN');

		result = await pool.query(
			`INSERT INTO matches (user1_id, user2_id) VALUES ($1, $2)`,
			[userId, matchedUserId]
		);
		
		await pool.query(
			`UPDATE users
			 SET match_nbr = match_nbr + 1
			 WHERE id IN ($1, $2)`,
			[userId, matchedUserId]
		);

		await pool.query(`COMMIT`);

	} catch (error) {
		await pool.query(`ROLLBACK`);
        throw new Error("Update match failed");
	}
	return result.rows[0];
};

// gets every matches of userId
// creates a tab with user2_id from the matches table where userId parameter is user1_id
// joined with user1_id from the matches table where userId parameter is user2_id
// in this tab, we put id, name and image
export const getUserMatches = async (userId) => {
	const result = await pool.query(
        `SELECT users.id, users.first_name, users.last_name, users.username, users.image
         FROM users
         JOIN matches ON users.id = matches.user2_id
         WHERE matches.user1_id = $1
		 UNION
		 SELECT users.id, users.first_name, users.last_name, users.username, users.image
		 FROM users
		 JOIN matches ON users.id = matches.user1_id
		 WHERE matches.user2_id = $1`,
        [userId]
    );
	return result.rows;
};

// gets every users that can be liked by currentUser
// select every users entry that are not currentUser
// that are not already liked or disliked
// that currentUser likes their gender or both
// and that like currentUser's gender or both
export const getUsersToLike = async (currentUser) => {
	const result = await pool.query(
		`SELECT id, username, first_name, last_name, gender, gender_preference,
			bio, image, likes, tags, match_nbr, city, loc, last_connection, updated_at, DATE_PART('year', AGE(birthday)) AS age,
			(6371 * acos(
					cos(radians($4)) * cos(radians(latitude)) * cos(radians(longitude) - radians($5)) +
					sin(radians($4)) * sin(radians(latitude))
				)) AS distance
		 FROM users
		 WHERE id != $1
		 AND id NOT IN (SELECT unnest(likes) FROM users WHERE id = $1)
		 AND id NOT IN (SELECT unnest(dislikes) FROM users WHERE id = $1)
		 AND ($2 = 'both' OR gender = $2)
		 AND gender_preference IN ($3, 'both')`,
		[currentUser.id, currentUser.gender_preference, currentUser.gender, currentUser.latitude, currentUser.longitude]
	);
	return result.rows;
};

export const getLikesForUserId = async (userId) => {
	const result = await pool.query(
		`SELECT id, username, image
		 FROM users
		 WHERE $1 = ANY(likes)`,
		[userId]
	);
	return result.rows;
}



/*
  CHAT
*/

// creates new chat in chats table
// with user1 and user2
export const createChat = async (user1_id, user2_id) => {
	const result = await pool.query(
		`INSERT INTO chats (user1_id, user2_id)
		 VALUES ($1, $2)`,
		[user1_id, user2_id]
	);
    return result.rows[0];
};

// gets chat by users inside this chat
export const findChatByUsers = async (user1_id, user2_id) => {
    const result = await pool.query(
        `SELECT * FROM chats
         WHERE (user1_id = $1 AND user2_id = $2)
				OR (user1_id = $2 AND user2_id = $1)`,
        [user1_id, user2_id]
    );
    return result.rows[0];
};

// creates new message in messages table
// with chat_id and sender_id and content
export const createMessage = async (chat_id, sender_id, content) => {
	const result = await pool.query(
		`INSERT INTO messages (chat_id, sender_id, content)
		 VALUES ($1, $2, $3)
         RETURNING *`,
		[chat_id, sender_id, content]
	);
    return result.rows[0];
};

// gets messages from one chat
// gets the sender's id, the content, and the timestamp
// in a tab
// ordered by date
export const findMessagesByChatId = async (chat_id) => {
	const result = await pool.query(
		`SELECT messages.sender_id, messages.content, messages.created_at
		 FROM messages
		 WHERE chat_id = $1
		 ORDER BY messages.created_at ASC`,
		[chat_id]
	);
	return result.rows;
};



/*
  SEARCH
*/

// gets users that correspond to criterias
// if no criteria, returns everyone
// searchQuery is a string sent with search bar
// ageGap are two numbers that can go from 18 to 100 years and be chosen from filters in search bar
// selectedTags is an array of string with tags selected from filters in search bar
// sort first by number of tags common with selectedTags,
// then by searchQuery correspondance,
// then by signup date order
	// 'cardinality' line :
	// unnest(tags) transform tags array to lines (tags being tags array from users table)
	// unnest($8::varchar[]) does the same with selectedTags argument
	// intersect gets elements that are in both sides only and creates kind of a list from it
	// list converted to an array with array() function
	// cardinality return the number of element from an array
export const findUsersFromSearch = async (searchQuery, ageGap, fameGap, selectedTags, latitude, longitude, distance) => {
    const tagsSize = selectedTags.length;
	const result = await pool.query(
		`WITH user_data AS (
			SELECT *,
				DATE_PART('year', AGE(birthday)) AS age,
				(6371 * acos(
					cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) +
					sin(radians($1)) * sin(radians(latitude))
				)) AS distance
			FROM users
			WHERE username ILIKE $3 or username ILIKE $4
		 )
		 SELECT id, username, first_name, last_name, gender, gender_preference, age, distance,
			bio, image, likes, tags, match_nbr, city, loc, last_connection, updated_at
		 FROM user_data
		 WHERE age >= $6
         AND age <= $7
         AND COALESCE((match_nbr::FLOAT / NULLIF(array_length(likes, 1), 0)) * 100, 0) >= $8
         AND COALESCE((match_nbr::FLOAT / NULLIF(array_length(likes, 1), 0)) * 100, 0) <= $9
         AND ($10 = 0 OR tags && $11::varchar[])  -- check if one element from $10 array is in tags
         AND (
				($1 IS NULL OR $2 IS NULL)
				OR (distance IS NULL)
				OR (
					CASE
						WHEN $12 = -1
						THEN distance > $12
						ELSE distance <= $12
					END)
				)
		 ORDER BY
            cardinality(array(select unnest(tags) intersect select unnest($11::varchar[]))) DESC,
            CASE
                WHEN username ILIKE $5 THEN 1
                WHEN username ILIKE $3 THEN 2
                ELSE 3
            END,
            created_at DESC`,
		[
			latitude,
			longitude,
			`%${searchQuery}%`,   // Partial correspondance
			`${searchQuery}%`,    // Correspondance from the start
			searchQuery,          // Exact correspondance
			ageGap.minAge,
			ageGap.maxAge,
			fameGap.minFame,
			fameGap.maxFame,
			tagsSize,
			selectedTags,
			distance
		]
	);
	return result.rows;
};



/*
  LOCATION
*/

// update user location
export const updateUserLocation = async (userId, coords, authorization) => {
	const result = await pool.query(
        `UPDATE users
         SET latitude = $1, longitude = $2, allowed_loc = $3
         WHERE id = $4
         RETURNING *`,
        [coords.latitude, coords.longitude, authorization, userId]
    );
	return result.rows[0];
};

export const updateUserCity = async (userId, city, loc) => {
	const result = await pool.query(
        `UPDATE users
         SET city = $1, loc = $2
         WHERE id = $3
         RETURNING *`,
        [city, loc, userId]
    );
	return result.rows[0];
};

// get users that are near current user
// using haversine formula (considering the Earth a perfect sphere of 6731 kilometres radius)
// maxDistance (in km) filters the result
// users are then ordered by distance
export const getUserNearbyUsers = async (userId, latitude, longitude, maxDistance) => {
    const result = await pool.query(
		`SELECT id, username, first_name, last_name, gender, gender_preference, age,
			bio, image, likes, tags, match_nbr, city, loc, last_connection, updated_at
         FROM (
            SELECT *, DATE_PART('year', AGE(birthday)) AS age,
                (6371 * acos(
                    cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) +
                    sin(radians($1)) * sin(radians(latitude))
                )) AS distance,
				((match_nbr::FLOAT / NULLIF(array_length(likes, 1), 0)) * 100) AS fame_rating
            FROM users
            WHERE id != $3
         ) AS subquery
         WHERE ($1 IS NULL OR $2 IS NULL OR distance <= $4)
         ORDER BY distance ASC;
        `,
		[latitude, longitude, userId, maxDistance]);
        return result.rows;
};





/*
  TAGS
*/

// creates new entry in tags table
export const createTag = async (tag_name) => {
    const result = await pool.query(
        `INSERT INTO tags (tag_name)
         VALUES ($1)
		 ON CONFLICT (tag_name) DO NOTHING
         RETURNING *`,
        [tag_name]
    );
	return result.rows[0];
};

// gets tag from tags table
export const getTag = async (tag_name) => {
    const result = await pool.query(
        `SELECT *
         FROM tags
         WHERE tag_name = $1`,
        [tag_name]
    );
	return result.rows[0];
};

// gets number of users having tag_name in their tags
export const getTagOccurence = async (tag_name) => {
	const result = await pool.query(
		`SELECT COUNT(*) AS usage_count
		 FROM users_tags
		 WHERE tag_id = (SELECT id FROM tags WHERE tag_name = $1)
		`,
		[tag_name]
	);
	return result.rows[0];
};

// gets every tags from user
// associates tags.id and users_tags.tag_id with join
// gets tags.tag_name when users_tags.user_id = user_id parameter
export const getUserTags = async (user_id) => {
	const result = await pool.query(
		`SELECT tags.tag_name
		 FROM tags
		 JOIN users_tags ON tags.id = users_tags.tag_id
		 WHERE users_tags.user_id = $1`,
		[user_id]
	);
	return result.rows;
};

// suppress tag from tags table
export const suppressTag = async (tag_name) => {
    await pool.query(
        `DELETE FROM tags
         WHERE tag_name = $1`,
        [tag_name]
    );
};

// adds a tag to the user tags array
// adds an entry to the users_tags table
export const createUsersTags = async (user_id, tag_name) => {
	try {
		await pool.query('BEGIN');

		await pool.query(
			`UPDATE users
			 SET tags = array_append(tags, $1)
			 WHERE id = $2`,
			[tag_name, user_id]
		);

		const result = await pool.query(
			`INSERT INTO users_tags (user_id, tag_id)
			 VALUES ($1, (SELECT id FROM tags WHERE tag_name = $2))
			 ON CONFLICT (user_id, tag_id) DO NOTHING
			 RETURNING *`,
			[user_id, tag_name]
		);

		await pool.query(`COMMIT`);
		return result.rows[0];
	} catch (error) {
		await pool.query(`ROLLBACK`);
        throw new Error("Update failed");
	}
};

// suppress users_tags for the user_id and tag_name
// suppress the tag from the user tags array
export const suppressTagFromUser = async (user_id, tag_name) => {
	try {
		await pool.query('BEGIN');

		await pool.query(
			`UPDATE users
			 SET tags = array_remove(tags, $1)
			 WHERE id = $2`,
			[tag_name, user_id]
		);

		const result = await pool.query(
			`DELETE FROM users_tags
			 WHERE user_id = $1
			 AND tag_id = (SELECT tags.id FROM tags WHERE tag_name = $2)`,
			[user_id, tag_name]
		);

		await pool.query(`COMMIT`);
		return result.rows[0];
	} catch (error) {
		await pool.query(`ROLLBACK`);
        throw new Error("Update failed");
	}
};

// return the 5 most popular tags
// sorted by usage_count
export const getPopularTags = async () => {
	const result = await pool.query(
		`SELECT tags.tag_name, COUNT(users_tags.user_id) AS usage_count
		 FROM tags
		 LEFT JOIN users_tags ON tags.id = users_tags.tag_id
		 GROUP BY tags.id
		 ORDER BY usage_count DESC
		 LIMIT 5`
	);
	return result.rows;
};

// gets tags that contains the argument 'tag_name' in them
// returns an array with those tags, sorted by correspondace
// limited to 10 tags returned
export const getSimilarTags = async (tag_name) => {
	const result = await pool.query(
		`SELECT *
		 FROM tags
		 WHERE tag_name ILIKE $1
		 OR tag_name ILIKE $2
     	 ORDER BY 
			CASE 
				WHEN tags.tag_name ILIKE $3 THEN 1  -- First priority to exact correspondance
				WHEN tags.tag_name ILIKE $4 THEN 2  -- Second priority to correspondance from the start
				ELSE 3                              -- Third priority to partial correspondance
			END
     	 LIMIT 10`,
		[
			`%${tag_name}%`,   // Partial correspondance
			`${tag_name}%`,    // Correspondance from the start
			tag_name,          // Exact correspondance
			`${tag_name}%`
		]
	);
	return result.rows;
};

// gets every tag that contains the argument 'tag_name' in them
// returns an array with those tags, sorted by correspondance
// then by usage_count
// usage_count being in the information returned for every tag
export const getSimilarTagsWithUsageCount = async (tag_name) => {
	const result = await pool.query(
		`SELECT tags.tag_name, COUNT(users_tags.user_id) AS usage_count
		 FROM tags
		 LEFT JOIN users_tags ON tags.id = users_tags.tag_id
		 WHERE tags.tag_name ILIKE $1
			OR tags.tag_name ILIKE $2
		 GROUP BY tags.id
		 ORDER BY 
			CASE 
				WHEN tags.tag_name ILIKE $3 THEN 1  -- First priority to exact correspondace
				WHEN tags.tag_name ILIKE $4 THEN 2  -- Second priority to correspondance from the start
				ELSE 3                              -- Third priority to partial correspondance
			END,
		 	usage_count DESC 						-- secondary priority : by usage_count`,
		[
			`%${tag_name}%`,   // Partial correspondance
			`${tag_name}%`,    // Correspondance from the start
			tag_name,          // Exact correspondance
			`${tag_name}%`
		]
	);
	return result.rows;
};

/*
  VERIFY
*/

export const updateUserVerification = async (userId, status) => {
	const result = await pool.query(
        `UPDATE users
         SET is_verified = $1
         WHERE id = $2
         RETURNING *`,
        [status, userId]
    );
	return result.rows[0];
};

export const updateUserResetTokens = async (userId, token, exp) => {
	const result = await pool.query(
        `UPDATE users
         SET reset_password_token = $1,
		 	 reset_password_expires = to_timestamp($2)
         WHERE id = $3
         RETURNING *`,
        [token, exp, userId]
    );
	return result.rows[0];
};

export const updateUserPasswordAndResetTokens = async (userId, newPassword, token, exp) => {
    const result = await pool.query(
        `UPDATE users
         SET password = $1,
             reset_password_token = $2,
             reset_password_expires = to_timestamp($3)
         WHERE id = $4
         RETURNING *`,
        [newPassword, token, exp, userId]
    );
    return result.rows[0];
};

export const updateUserEmail = async (userId) => {
    const result = await pool.query(
        `UPDATE users
         SET email = pending_email,
		 	 pending_email = NULL,
             email_change_token = NULL,
             email_change_expires = NULL
         WHERE id = $1
         RETURNING *`,
        [userId]
    );
    return result.rows[0];
};


/*
  VIEWS
*/

// creates new entry in views table
export const createView = async (viewer_username, viewed_username) => {
	const result = await pool.query(
		`INSERT INTO views (viewer_id, viewed_id)
		 SELECT viewer.id, viewed.id
		 FROM users AS viewer, users AS viewed
		 WHERE viewer.username = $1 AND viewed.username = $2
		 ON CONFLICT (viewer_id, viewed_id) DO NOTHING
		 RETURNING *`,
		[viewer_username, viewed_username]
	);
	return result.rows[0];
};

// add view to existing view relationship
export const addView = async (viewer_username, viewed_username) => {
	const result = await pool.query(
		`UPDATE views
		 SET view_count = view_count + 1
		 WHERE viewer_id = (SELECT id FROM users WHERE username = $1)
		 AND viewed_id = (SELECT id FROM users WHERE username = $2)
		 RETURNING *`,
		[viewer_username, viewed_username]
	);

	if (result.rows.length === 0) {
        throw new Error("Add view failed");
    }

	return result.rows[0];
};

// get views done by the viewer (by username)
export const getViewsFromViewer = async (viewer_username) => {
	const result = await pool.query(
		`SELECT views.*, viewed.username AS viewed_username, viewed.image AS viewed_image
		 FROM views
		 JOIN users AS viewed ON viewed.id = views.viewed_id
		 JOIN users AS viewer ON viewer.id = views.viewer_id
		 WHERE viewer.username = $1
		 ORDER BY viewed_at DESC`,
		[viewer_username]
	);

	return result.rows;
};

// get views received by the viewed (by username)
export const getViewsOfViewed = async (viewed_username) => {
	const result = await pool.query(
		`SELECT views.*, viewer.username AS viewer_username, viewer.image AS viewer_image
		 FROM views
		 JOIN users AS viewed ON viewed.id = views.viewed_id
		 JOIN users AS viewer ON viewer.id = views.viewer_id
		 WHERE viewed.username = $1
		 ORDER BY viewed_at DESC`,
		[viewed_username]
	);

	return result.rows;
};

// get views from one user to another (by usernames)
export const getViewFromViewerToViewed = async (viewer_username, viewed_username) => {
	const result = await pool.query(
		`SELECT views.* FROM views
		 WHERE viewer_id = (SELECT id FROM users WHERE username = $1)
		 AND viewed_id = (SELECT id FROM users WHERE username = $2)`,
		[viewer_username, viewed_username]
	);

	return result.rows;
};




/*
  NOTIFICATION
*/

// creates new entry in notification table
export const createNotification = async (type, sender_username, receiver_username, state) => {
	const result = await pool.query(
		`INSERT INTO notification (type, seen, sender_id, receiver_id)
		 SELECT $1, $4, sender.id, receiver.id
		 FROM users AS sender, users AS receiver
		 WHERE sender.username = $2 AND receiver.username = $3
		 RETURNING *`,
		[type, sender_username, receiver_username, state]
	);
	return result.rows[0];
};

// get all notification for user
export const getNotificationsForUsername = async (receiver_username) => {
	const result = await pool.query(
		`SELECT notification.*,
			sender.username AS sender_username,
			sender.image AS sender_image,
			sender.id AS sender_id
		 FROM notification
		 JOIN users AS receiver ON receiver.id = notification.receiver_id
		 JOIN users AS sender ON sender.id = notification.sender_id
		 WHERE receiver.username = $1
		 ORDER BY notification.created_at DESC`,
		[receiver_username]
	);
	return result.rows;
};

export const setNotificationIdAsSeen = async (notification_id) => {
	const result = await pool.query(
		`UPDATE notification
		 SET seen = true
		 WHERE id = $1`,
		[notification_id]
	);
	return result.rows;
};