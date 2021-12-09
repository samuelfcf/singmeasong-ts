import getYouTubeID from "get-youtube-id";
import { cwd } from "process";

import * as recommendationRepository from "../repositories/recommendationRepository";

interface ISaveRecommendation {
  name: string, 
  youtubeLink: string
}

interface IChangeRecommendationScore {
  id: number,
  increment: number
}


export async function saveRecommendation({name, youtubeLink}: ISaveRecommendation) {
  const youtubeId = getYouTubeID(youtubeLink);

  if (youtubeId === null) {
    return null;
  }

  const initialScore = 0;
  return await recommendationRepository.create({name, youtubeLink, score: initialScore});
}

export async function upvoteRecommendation(id: number) {
  return await changeRecommendationScore({id, increment: 1});
}

export async function downvoteRecommendation(id: number) {
  const recommendation = await recommendationRepository.findById(id);
  if (recommendation.score === -5) {
    return await recommendationRepository.destroy(id);
  } else {
    return await changeRecommendationScore({id, increment: -1});
  }
}

export async function getRandomRecommendation() {
  const random = Math.random();

  let recommendations;
  const orderBy = "RANDOM()";
  
  if (random > 0.7) {
    recommendations = await recommendationRepository.findRecommendations({minScore: -5, maxScore: 10, orderBy});
  } else {
    recommendations = await recommendationRepository.findRecommendations({minScore: 11, maxScore: Infinity, orderBy})
  };

  return recommendations[0];
}

async function changeRecommendationScore({id, increment}: IChangeRecommendationScore) {
  const result = await recommendationRepository.incrementScore({id, increment});
  return result.rowCount === 0 ? null : result;
}
