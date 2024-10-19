const axios = require('axios');
const fs = require('fs');
const xml2js = require('xml2js');

async function fetchSitemap() {
    try {
        // Fetch the sitemap
        const response = await axios.get('https://www.pagalworld.com.sb/sitemap.xml');
        const xml = response.data;

        // Parse the XML
        const parser = new xml2js.Parser();
        parser.parseString(xml, (err, result) => {
            if (err) {
                throw err;
            }

            // Extract URLs
            const urls = result.urlset.url.map((urlObj) => urlObj.loc[0]);
            const formattedUrls = urls.map(url => `"${url}"`).join(',\n');

            // Save to a file
            fs.writeFileSync('urls.txt', formattedUrls, 'utf8');
            console.log('URLs saved to urls.txt');
        });
    } catch (error) {
        console.error('Error fetching the sitemap:', error);
    }
}

fetchSitemap();
