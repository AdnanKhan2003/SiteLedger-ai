// Native fetch is available in Node.js v18+

async function seed() {
    try {
        console.log('Triggering seed...');
        const response = await fetch('http://localhost:5000/api/test/seed', {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Seed response:', data);
    } catch (error) {
        console.error('Seed failed:', error);
    }
}

seed();
