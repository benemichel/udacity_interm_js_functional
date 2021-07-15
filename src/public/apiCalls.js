require(['store'], function(apiCalls, storeModule) {
    const {updateStore, store} = storeModule

    // ----- API CALLS -------
    define(['apiCalls'], function () {
        const getRoverManifests = async (state) => {
            let {rovers} = state
            let manifests = [];

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
                console.log(manifests)
                updateStore(store, {roverManifests: manifests})
                let {roverManifests} = store
                console.log(roverManifests)
            })

            return manifests
        }
        return {getRoverManifests};
    });
})




// const getRoverImages = function (state) {
//     const {roverManifests} = state
//
// }
