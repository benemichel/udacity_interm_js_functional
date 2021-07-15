define(['store'], function () {
    const updateStore = (store, newState, renderFunc, root) => {
        store = Object.assign(store, newState)
        renderFunc(root, store)
    }

    let store = {
        user: {name: "Student"},
        rovers: ['Curiosity', 'Opportunity', 'Spirit'],
        roverManifests: [],
        alreadyRequested: false
    }

    return { store, updateStore}
})
