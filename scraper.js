var axios = require('axios');
var cheerio = require('cheerio');

exports.scrapeAndDownload = function (pageUrl) {
    return axios.get(pageUrl)
        .then(function (response) {
            var data = response.data;
            var $ = cheerio.load(data);

            var songDetails = {};

            var songName = $('h1').text().trim();
            var slug = pageUrl.split('/').pop().replace('.html', '');
            // var cleanedSongName = songName.split(' (')[0].trim();
            var cleanedSongName = songName.split(' Song Download')[0].trim();
            var cleanedSlug = slug;

            console.log(slug);


            songDetails.Name = cleanedSongName;
            songDetails.slug = cleanedSlug;
            songDetails.size = $('table tr:contains("Size")').find('b').text().trim();
            songDetails.duration = $('table tr:contains("Duration")').find('b').text().trim();
            songDetails.singer = $('table tr:contains("Singer")').find('b a').text().trim();
            songDetails.music = $('table tr:contains("Music")').find('b a').text().trim();
            songDetails.lyrics = $('table tr:contains("Lyrics")').find('b a').text().trim();
            songDetails.label = $('table tr:contains("Label")').find('b a').text().trim();

            // Extract categories
            var categories = [];
            $('div[class="bpan"]').find('a').each((i, aElem) => {
                const categoryTitle = $(aElem).text().trim();
                if (categoryTitle) {
                    categories.push(categoryTitle);
                }
            });
            songDetails.Categories = categories.join(', ');

            // Extract download links
            var downloadLinks = [];
            $('div.bpan.c').find('a.dbutton').each((i, linkElem) => {
                const title = $(linkElem).attr('title');
                if (title) {
                    downloadLinks.push(title);
                }
            });
            songDetails.downloads = downloadLinks.join(', ');

            console.log('Scraped details:', songDetails);
            return songDetails;
        })
        .catch(function (error) {
            console.error('Error scraping the page ' + pageUrl + ':', error.message);
            return null;
        });
};
