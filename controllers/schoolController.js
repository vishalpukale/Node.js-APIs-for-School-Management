// Add School API

exports.addSchool = async (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    // Validation
    if (!name || !address || typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({ message: 'All fields are required and must be of the correct type.' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
            [name, address, latitude, longitude]
        );
        res.status(201).json({ id: result.insertId, message: 'School added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Database error', error });
    }
};






// List Schools API


const db = require('../config/db');

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

exports.listSchools = async (req, res) => {
    const { latitude, longitude } = req.query;

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({ message: 'Latitude and longitude must be numbers.' });
    }

    try {
        const [schools] = await db.query('SELECT * FROM schools');
        
        schools.sort((a, b) => {
            const distA = calculateDistance(latitude, longitude, a.latitude, a.longitude);
            const distB = calculateDistance(latitude, longitude, b.latitude, b.longitude);
            return distA - distB;
        });

        res.json(schools);
    } catch (error) {
        res.status(500).json({ message: 'Database error', error });
    }
};
