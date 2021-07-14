require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')
const cors = require('cors')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cors())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls
app.get('/rover/:rover', async (req, res) => {
    const params = req.params;
    const roverName  = params.rover;

    try {
        let missionManifest = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${roverName}?api_key=${process.env.API_KEY}`)
            .then(res => res.json())

        const maxSol = res.photo_manifest.max_sol

        let lastPhotos = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/photos?sol=${maxSol}&api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send(lastPhotos)
        res.status(200);
    } catch (err) {
        console.log('error:', err);
    }

})

// example API call
app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({image})
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
