
const axios = require('axios');

const seed = async () => {
    try {
        console.log("Triggering seed...");
        const res = await axios.post('http://localhost:5000/api/test/seed');
        console.log("Seed Response:", res.data);
    } catch (err) {
        console.error("Seed Failed:", err.message);
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", err.response.data);
        }
    }
};

seed();
