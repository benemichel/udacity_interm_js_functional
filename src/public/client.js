let store = {
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    roverManifests: [],
    alreadyRequested: false,
    roverImages: [],
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    console.log("store update with:", newState)
    // render(root, store)
}

const render = async (root, state) => {
    // render app with updated state
    root.innerHTML = App(state)
}


// create content
const App = (state) => {

    return `
        <header>${Header()}</header>
        <main>
            
            <section class="control_panel">
                ${Tabs(state.rovers)}
                ${TabContent()}
           
            </section>
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})


// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information
const Header = () => {
    return ` <h1 class="title">Welcome Commander!</h1> 
            <h2 class="subtitle">To your Mars mission control panel </h2>`
}

const Tabs = (rovers) => {
    if (rovers) {

        const tablinks = [];
        rovers.forEach(rover => {
            tablinks.push(`<button class="tablinks">${rover}</button>`)
        })
        return `<div class="tab">${tablinks.join("")} </div> `
    }

    return `
        <h1>No rovers available!</h1>
    `
}

const TabContent = () => {

    renderInformation()
    return `
    <div  id="tabcontent">
    </div>
    `
}

// Example of a pure function that renders infomation requested from the backend
const renderInformation = () => {

    let {alreadyRequested} = store
    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    // const photodate = new Date(apod.date)
    // console.log(photodate.getDate(), today.getDate());
    //
    // console.log(photodate.getDate() === today.getDate());
    // if (!apod || apod.date === today.getDate()) {
    if (!alreadyRequested) {
        // getImageOfTheDay(store)
        updateStore(store, {alreadyRequested: true})
        getRoverManifests(store)

    }

    // check if the photo of the day is actually type video!
    // if (apod.media_type === "video") {
    //     return (`
    //         <p>See today's featured video <a href="${apod.url}">here</a></p>
    //         <p>${apod.title}</p>
    //         <p>${apod.explanation}</p>
    //     `)
    // } else {
    //     return (`
    //         <img src="${apod.image.url}" height="350px" width="100%" />
    //         <p>${apod.image.explanation}</p>
    //     `)
    // }
}

// ----- API CALLS -------
const getRoverManifests = async (state) => {
    let {rovers} = state
    let manifests = [];

    // cache
    if (state.roverManifests.length === 0){
        let promises = rovers.map(rover => {
            return fetch(`http://localhost:3000/rovers/${rover}`)
                .then(res => {
                    return res.json()
                })
                .then(manifest => {
                    manifests.push(manifest)
                })
        })

        Promise.all(promises).then(res => {
            updateStore(store, {roverManifests: manifests})
            let {roverManifests} = store
            console.log("manifests from store after promise.all()", roverManifests)
        })
    }

    return manifests
}

const getRoverImages = async function (state, roverName) {
    const {roverManifests} = state
    const { roverImages } = state
    console.log("roverImages before", roverImages)


    const maxSol = roverManifests.filter((manifest) => manifest.name === roverName)[0].max_sol

    // cache
    if (roverImages.length === 0 || roverImages.filter( image => image.rover.name === roverName).length === 0){
        await fetch(`http://localhost:3000/rovers/${roverName}/images?max_sol=${maxSol}`).then( res => {
            return res.json()
        }).then( data => {
            console.log("api images", data)
            updateStore(state, {roverImages: roverImages.concat(data.photos)})
            return data.photos
        })
    }

}

const tabActivator = function (roverManifest, roverImages) {
    const roverInfoSection = createRoverInfoSection(roverManifest)
    const tabContent = document.getElementById('tabcontent')
    const roverContainer = document.createElement('div')

    roverContainer.classList.add("rover_container")
    roverContainer.appendChild(roverInfoSection)

    //fetch images
    getRoverImages(store, roverManifest.name).then( () => {
        const {roverImages} = store

        const roverImagesForRover = roverImages.filter((image) => image.rover.name === roverManifest.name)
        const roverImageSection = createRoverImageSection(roverImagesForRover)
        roverContainer.appendChild(roverImageSection)
    })

    tabContent.innerHTML = ""
    tabContent.appendChild(roverContainer)

    //render images
    // const {roverImages} = store

}



document.addEventListener('click', function (event) {
    let target = event.target;

    if (target && target.className === 'tablinks') {
        let {roverManifests} = store
        let {roverImages} = store
        const roverManifest = roverManifests.filter((manifest) => {
            target = event.target;

            return manifest.name === target.innerText
        })[0]
        tabActivator(roverManifest, roverImages)
    }
})




const createRoverInfoSection = function (roverManifest) {
    const container = document.createElement('div')
    container.classList.add("rover_info")

    const infoSection = document.createElement('div')

    const createNodeWithInfo = function(text) {
        const p = document.createElement('p')
        const textNode = document.createTextNode(text)
        p.appendChild(textNode)
        return p

    }

    infoSection.appendChild(createNodeWithInfo(`Name: ${roverManifest.name}`))
    infoSection.appendChild(createNodeWithInfo(`Landed: ${roverManifest.landing_date}`))
    infoSection.appendChild(createNodeWithInfo(`Launched: ${roverManifest.launch_date}`))
    infoSection.appendChild(createNodeWithInfo(`Last Images: ${roverManifest.max_date}`))
    infoSection.appendChild(createNodeWithInfo(`Status: ${roverManifest.status}`))

    container.appendChild(infoSection)
    return container

}


const createRoverImageSection = function (roverImages) {
    const container = document.createElement('div')
    container.classList.add("rover_images")


    roverImages.forEach( image => {
        const img = document.createElement('img');
        img.src = image.img_src
        container.appendChild(img)
    })

    console.log(container)
    return container

}
