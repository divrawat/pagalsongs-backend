const Song = require('../models/song');
const { scrapeAndDownload } = require('../scraper');


const saveScrapedDataOnStartup = async () => {
    try {

        const pageUrls = [

        ]

        console.log('Scraping and saving data on server startup...');

        // Scrape data for each URL
        for (const pageUrl of pageUrls) {
            const songData = await scrapeAndDownload(pageUrl);

            if (!songData) {
                continue;  // If scraping failed, skip this URL
            }

            // Check if the song with the same slug already exists
            const existingSong = await Song.findOne({ slug: songData.slug });

            if (!existingSong) {
                // Save the song to the database if it doesn't exist
                const newSong = new Song(songData);
                await newSong.save();
                console.log(`Song saved: ${songData.Name}`);
            } else {
                console.log(`Song already exists: ${songData.Name}`);
            }
        }

        console.log('Scraping and saving complete on server startup!');
    } catch (error) {
        console.error('Error in saving scraped data on startup:', error.message);
    }
};

// Export the function
module.exports = {
    saveScrapedDataOnStartup
};
