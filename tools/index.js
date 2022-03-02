const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const key = process.env.API_KEY;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.config = {
    params: 
    {
        api_key : key
    } 
};

module.exports.reverseGeo = async (coordinates) => {
    try {
        const geoData = await geocoder.reverseGeocode({
            query: coordinates,
            limit: 1    
        }).send()

        if(geoData.body.features[0]){
            return geoData.body.features[0].text;
        } else{
            return 'NO LOCATION'
        }
    } catch (error) {
        console.log("ERROR!:", error)
    }
}
