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

// ----- routes -----
app.get('/rovers/:rover', async (req, res) => {
    const params = req.params;
    const roverName  = params.rover;

    try {
        let missionManifest = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${roverName}?api_key=${process.env.API_KEY}`)
            .then(res => res.json().then( data => {
                const manifest = data.photo_manifest

                return {
                    name: manifest.name,
                    landing_date: manifest.landing_date,
                    launch_date: manifest.launch_date,
                    max_date: manifest.max_date,
                    max_sol: manifest.max_sol,
                    status: manifest.status
                }
            }))

        res.send(missionManifest)
        res.status(200);
    } catch (err) {
        console.log('error:', err);
    }

})

app.get('/rovers/:rover/images', async (req, res) => {
    const params = req.params;
    const roverName  = params.rover;

    const query = req.query
    const maxSol = query.max_sol


    try {
        let images = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/photos?sol=${maxSol}&api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send(images)
        res.status(200);
    } catch (err) {
        console.log('error:', err);
        res.status(500);
    }
})


// start server
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
