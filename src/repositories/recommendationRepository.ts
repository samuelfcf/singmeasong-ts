import connection from "../database";

interface IRecommendation {
  id: number,
  name: string,
  youtubeLink: string, 
  score: number,
}

interface IRecommendationCreate {
  name: string,
  youtubeLink: string, 
  score: number,
}

interface IRecommendationIncrement {
  id: number,
  increment: number
}

interface IFindRecommendation {
  minScore: number,
  maxScore: number,
  orderBy: string
}


export async function create({name, youtubeLink, score}: IRecommendationCreate) {
  await connection.query(
    `
    INSERT INTO recommendations
    (name, "youtube_link", score)
    VALUES
    ($1, $2, $3)
  `,
    [name, youtubeLink, score]
  );
}

export async function findById(id: number): Promise<IRecommendation> {
  const result = await connection.query(
    `
    SELECT * FROM recommendations WHERE id = $1
  `,
    [id]
  );

  return result.rows[0];
}

export async function incrementScore({id, increment}: IRecommendationIncrement) {
  return await connection.query(
    `
    UPDATE recommendations SET score = score + $1 WHERE id = $2
  `,
    [increment, id]
  );
}

export async function destroy(id: number) {
  return await connection.query(
    `
    DELETE FROM recommendations WHERE id = $1
  `,
    [id]
  );
}

export async function findRecommendations({
  minScore,
  maxScore = Infinity,
  orderBy= ""
}: IFindRecommendation): Promise<IRecommendation[]> {
  let where = "";
  let params = [minScore];

  if (maxScore === Infinity) {
    where = "score >= $1";
  } else {
    where = "score BETWEEN $1 AND $2";
    params.push(maxScore);
  }

  let query = `SELECT * FROM recommendations WHERE ${where}`;

  if (orderBy) {
    query += ` ORDER BY ${orderBy}`;
  }

  const result = await connection.query(query, params);

  return result.rows;
}
