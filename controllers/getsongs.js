const Song = require('../models/song');
const multer = require('multer');
const slugify = require('slugify');
const upload = multer({});

const GetAllSongs = async (req, res) => {

    try {
        const totalCount = await Song.countDocuments().exec();
        const page = Number(req.query.page) || 1;
        const perPage = 50;
        const { search } = req.query;
        const query = { $and: [{ name: { $regex: search, $options: 'i' } }] };
        const skip = (page - 1) * perPage;
        const data = await Song.find(query).select('Name slug singer downloads duration -_id').skip(skip).limit(perPage).exec();

        res.json({
            status: true,
            message: 'All Songs Fetched Successfully',
            totalsongs: totalCount, data
        });
    } catch (err) { console.error('Error fetching Songs:', err); res.status(500).json({ error: 'Internal Server Error' }); }
};


const GetAllSongsDashBoard = async (req, res) => {

    try {
        const totalCount = await Song.countDocuments().exec();
        const page = Number(req.query.page) || 1;
        const perPage = 100;
        const { search } = req.query;
        const query = { $and: [{ Name: { $regex: search, $options: 'i' } }] };
        const skip = (page - 1) * perPage;
        const data = await Song.find(query).skip(skip).limit(perPage).exec();

        res.json({
            status: true,
            message: 'All Songs Fetched Successfully',
            totalsongs: totalCount, data
        });
    } catch (err) { console.error('Error fetching Songs:', err); res.status(500).json({ error: 'Internal Server Error' }); }
};



const UpdateSong = async (req, res) => {
    const { id } = req.params;
    upload.none()(req, res, async (err) => {
        if (err) { return res.status(400).json({ error: 'Something went wrong' }); }

        try {
            let song = await Song.findById(id);
            if (!song) { return res.status(404).json({ error: 'song not found' }); }

            const { Name, singer, duration, slug, label, Categories, size, music, lyrics } = req.body;
            const updatefields = req.body;
            // console.log(req.body);

            Object.keys(updatefields).forEach((key) => {
                if (key === 'Name') { song.Name = Name; }
                if (key === 'singer') { song.singer = singer; }
                else if (key === 'duration') { song.duration = duration; }
                else if (key === 'music') { song.music = music; }
                else if (key === 'label') { song.label = label; }
                else if (key === 'size') { song.size = size; }
                else if (key === 'lyrics') { song.lyrics = lyrics; }
                else if (key === 'slug') { song.slug = slugify(updatefields.slug).toLowerCase(); }
                else if (key === 'Categories') { song.Categories = Categories; }
            });

            const savedsong = await song.save();

            return res.status(200).json(savedsong);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });
}


const addSong = async (req, res) => {
    upload.none()(req, res, async (err) => {
        if (err) { return res.status(400).json({ error: 'Something went wrong' }); }

        const { Name, slug, size, singer, duration, lyrics, label, Categories, music } = req.body;
        const slugifiedSlug = slugify(slug).toLowerCase();
        let song = new Song({
            Name,
            slug: slugifiedSlug,
            size,
            singer,
            duration,
            lyrics,
            label,
            Categories,
            music
        });

        try {
            const savedSong = await song.save();
            res.json(savedSong);

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error saving song: "Slug Should Be Unique"' });
        }
    });
};



const DeleteSong = async (req, res) => {
    const { id } = req.params;

    if (!id) { return res.status(404).json({ error: 'Song not found' }); }

    try {
        const song = await Song.findByIdAndDelete(id);
        if (!song) { return res.status(404).json({ error: 'Song not found' }); }

        return res.status(200).json({ message: 'Song deleted successfully' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


const GetSingleSong = async (req, res) => {
    try {
        const slug = req.params.slug.toLowerCase();
        const data = await Song.findOne({ slug }).exec();
        if (!data) { return res.status(404).json({ error: 'Song not found' }); }
        res.json(data);
    } catch (err) {
        console.log(err);
        res.json({ error: "Internal Server Error" });
    }
}



const GetSongsPerCategory = async (req, res) => {
    try {
        const { slug } = req.query;
        const cleanedSlug = slug.replace(/-/g, ' ');

        const regex = new RegExp(cleanedSlug, 'i');

        const songs = await Song.find({ Categories: { $regex: regex } }).exec();
        if (!songs || songs.length === 0) {
            return res.status(404).json({ error: 'There are no songs in this category' });
        }

        const page = Number(req.query.page) || 1;
        const perPage = 50;
        const skip = (page - 1) * perPage;

        const totalCount = songs.length;
        const paginatedSongs = await Song.find({ Categories: { $regex: regex } }).skip(skip).limit(perPage).exec();

        res.json({ page, perPage, totalCount, songs: paginatedSongs });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};




const SearchSongs = async (req, res) => {
    const { songname } = req.query;
    const cleanedquery = songname.replace(/-/g, ' ');

    try {
        const regex = new RegExp(cleanedquery, 'i');

        // Pagination parameters
        const page = Number(req.query.page) || 1;
        const perPage = 30;
        const skip = (page - 1) * perPage;

        // Find songs matching either Name or singer
        const totalCount = await Song.countDocuments({
            $or: [
                { Name: { $regex: regex } },
                { singer: { $regex: regex } }
            ]
        }).exec();

        if (totalCount === 0) {
            return res.json({ error: 'No songs found' });
        }

        // Calculate max pages
        const maxPages = Math.ceil(totalCount / perPage);



        // Validate requested page number
        if (page > maxPages || page < 1) {
            return res.json({ error: `Requested page exceeds total pages available (${maxPages})` });
        }

        // Fetch paginated results
        const paginatedSongs = await Song.find({
            $or: [
                { Name: { $regex: regex } },
                { singer: { $regex: regex } }
            ]
        })
            .skip(skip)
            .limit(perPage)
            .exec();

        res.json({ page, perPage, totalCount, maxPages, songs: paginatedSongs });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};









const Download = async (req, res) => {
    const { slug, quality, Name } = req.params;

    try {
        const fileUrl = `https://content.pagalsongs.online/song-audio/${slug}-${quality}.mp3`;
        const fileName = `${Name}-${quality} Kbps (Pagalsongs.online).mp3`;
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const streamToClient = async () => {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value);
            }
            res.end();
        };

        await streamToClient();

    } catch (error) {
        console.error('Error fetching file:', error);
        res.status(500).send('Failed to download song');
    }
};

module.exports = {
    GetAllSongs, GetAllSongsDashBoard, UpdateSong, addSong, DeleteSong, GetSingleSong, GetSongsPerCategory, SearchSongs, Download
};