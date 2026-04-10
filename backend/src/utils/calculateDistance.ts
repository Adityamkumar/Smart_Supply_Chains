import { ApiError } from "./ApiError.js";

export function calculateDistance([lng1, lat1]: number[], [lng2, lat2]: number[]) {
  if (!lng1 || !lat1 || !lng2 || !lat2) {
    throw new ApiError(400, "coordinates are missing");
  }
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  const distance = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  


  if (distance === 0) {
    return 0.01 + Math.random() * 0.04; 
  }

  return distance;
}
