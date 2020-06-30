const axios = require('axios');
const Station = require("../models/station");

const requestCityBikeApi = async () =>{
    const citybikeurl = "http://api.citybik.es/v2/networks/decobike-miami-beach";
    const response = await axios.get(citybikeurl);
    return response.data.network.stations;
};

const fillStations = async () => {
    try {
        const first = await Station.findOne();

        if (first) return;

        const stations = await requestCityBikeApi();
        const formatted = stations.map( station => {
            const { id, name, free_bikes, empty_slots, timestamp, latitude, longitude } = station;
            const location = {
                type: 'Point',
                coordinates: [
                    longitude,
                    latitude
                ]
            };

            return {
                id,
                name,
                location,
                history: [{timestamp, free_bikes, empty_slots}]
            }
        });
        await Station.collection.insertMany(formatted);

    } catch (error) {
        console.log("error", error);
    }
}

const updateStations = async () => {
    try {
        const stations = await requestCityBikeApi();
        const bulkUpdateOperations = [];

        for (st of stations) {
            const { free_bikes, empty_slots, timestamp } = st;
            bulkUpdateOperations.push({
                'updateOne':{
                    'filter': {'id': st.id},
                    'update': {$push: {history:{ timestamp, free_bikes, empty_slots }}}
                }
            });
        }

        await Station.collection.bulkWrite(bulkUpdateOperations, {ordered: true, w:1})
    } catch (error) {
        console.log("error", error);
    }
}

const getDesiredAvailability = async (step) => {
    const stations = await Station.aggregate([
        {
            $project:
            {
                _id: 0,
                name: 1,
                location: 1,
                availability: { $arrayElemAt: [ "$history", parseInt(step) ]}
            }
        }
    ]);
    const first = await Station.findOne();

    return { stations, limit:first.history.length };
}

module.exports = {
    fillStations,
    updateStations,
    getDesiredAvailability
};
