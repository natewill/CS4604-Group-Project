import axios from "axios";

//Consider moving this to the backend bc it uses google maps api
export const validateAddress = async (address) => {
  try {
    // helper function to take address and convert to
    // ["street address", "city, state, zip code"]
    const toAddressLines = (input) => {
      // if input is already array skip
      if (Array.isArray(input)) {
        return input;
      }
      const raw = typeof input === "string" ? input.trim() : "";
      if (!raw) return [""];
      const firstCommaIndex = raw.indexOf(",");
      if (firstCommaIndex === -1) {
        return [raw];
      }
      // We expect 123, street name city, state, zip
      const line1 = raw.slice(0, firstCommaIndex).trim();
      const line2 = raw.slice(firstCommaIndex + 1).trim();
      return [line1, line2];
    };

    const addressLines = toAddressLines(address);
    const body = {
      addressLines,
      regionCode: "US",
    };

    // We do API call on server side
    const response = await axios.post("/api/validate-address", body);
    console.log("Validation result:", response.data);

    return response.data.result?.verdict?.addressComplete === true;
  } catch (error) {
    console.error(
      "Address validation failed:",
      error.response?.data || error.message
    );
    return false;
  }
};
