import { asyncHandler } from "./AsyncHandler.js";
import { ApiError } from "./ApiError.js";
import axios from "axios";

/**
 * Function to get geolocation data based on the provided IP address.
 * @param {string} ip - The IP address to fetch geolocation details for.
 * @returns {Object} - The geolocation data (city, country, region, latitude, longitude, ip).
 */
const getGeoLocation = asyncHandler(async (ip) => {
  const url = `http://api.ipstack.com/${ip}?access_key=${process.env.GEO_IP_STACK_API_KEY}`;

  try {
    const res = await axios.get(url);

    if (res.data.error) {
      throw new ApiError(
        400,
        `Error fetching geolocation data: ${res.data.error.info}`
      );
    }

    const {
      city,
      country_name,
      region_name,
      latitude,
      longitude,
      ip: ipAddress,
    } = res.data;

    return {
      city,
      country: country_name,
      region: region_name,
      latitude,
      longitude,
      ip: ipAddress,
    };
  } catch (error) {
    throw new ApiError(500, `Failed to get geolocation: ${error.message}`);
  }
});

export { getGeoLocation };
