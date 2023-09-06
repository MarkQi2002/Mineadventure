// Import Modules
// parentPort Is Used To Communicate With Parent Thread
const {parentPort} = require('worker_threads');

var {map, mapList, unitModifiedList} = require('./mapClass.js');
const {object, sphere, allObject} = require('./object.js');
const {player, AI, properties, allPlayer, defaultProperties, creatureRemoveList} = require('./serverCreature.js');
const {projectile, projectileRemoveList} = require('./serverProjectile.js');

// Variable Declaration
var workerMapList, workerIndex, workerNumber;
var lastTime = new Date().getTime();

// Initialize Workers
function initWorker(data) {
    // Initialize Worker Thread Variables
    workerIndex = data.workerIndex;
    workerNumber = data.workerNumber;

    workerMapList = data.workerMapList;
    for (let i = 0; i < workerMapList.length; ++i){
        Object.setPrototypeOf(workerMapList[i], map.prototype);
        workerMapList[i].initWorkerMap();
    }

    // Send Init Message To Parent Thread
    parentPort.postMessage({type: "init"})
}

// Worker Thread Loop
function workerLoop(delta) {
    // Variable Declaration
    let i, j, theProjectile, thePlayer, theAI, theMap;
    for (i = 0; i < workerMapList.length; ++i) {
        theMap = workerMapList[i];
        unitModifiedList.length = 0;
        creatureRemoveList.length = 0;
        projectileRemoveList.length = 0;

        // Add Projectile Into Quad Tree
        for (j = 0; j < theMap.projectileIDArray.length[0]; ++j) {
            theProjectile = allObject.list[theMap.projectileIDArray.list[j]];

            if (theProjectile == null || theProjectile.update(delta)) continue;

            theMap.objectTree.insert({
                x: theProjectile.position[0],
		        y: theProjectile.position[1],
		        width: theProjectile.getRadius(),
			    height: theProjectile.getRadius(),
                ID: theProjectile.ID,
            });

        }

        // Add Player Into Quad Tree
        for (j = 0; j < theMap.playerIDArray.length[0]; ++j) {
            thePlayer = allObject.list[theMap.playerIDArray.list[j]];

            if (thePlayer == null) continue;

            theMap.objectTree.insert({
                x: thePlayer.position[0],
		        y: thePlayer.position[1],
		        width: thePlayer.getRadius(),
			    height: thePlayer.getRadius(),
                ID: thePlayer.ID,
            });
        }

        // Add AI Into Quad Tree
        for (j = 0; j < theMap.AIIDArray.length[0]; ++j) {
            theAI = allObject.list[theMap.AIIDArray.list[j]];

            if (theAI == null) continue;

            theMap.objectTree.insert({
                x: theAI.position[0],
		        y: theAI.position[1],
		        width: theAI.getRadius(),
			    height: theAI.getRadius(),
                ID: theAI.ID,
            });
        }

        // Player Update
        for (j = 0; j < theMap.playerIDArray.length[0]; ++j) {
            thePlayer = allObject.list[theMap.playerIDArray.list[j]];

            if (thePlayer == null) continue;

            thePlayer.update();
        }

        // AI Update
        for (j = 0; j < theMap.AIIDArray.length[0]; ++j) {
            theAI = allObject.list[theMap.AIIDArray.list[j]];

            if (theAI == null) continue;

            theAI.update(delta);
        }

        // Any Modified Unit Send Message To Parent Thread
        if (unitModifiedList.length != 0 || creatureRemoveList.length != 0 || projectileRemoveList.length != 0) {
            parentPort.postMessage({
                type: "updateMap",
                mapIndex: theMap.index,
                unitModifiedList: unitModifiedList,
                creatureRemoveList: creatureRemoveList,
                projectileRemoveList: projectileRemoveList
            })
        }

        // Clear Object Tree After Each Iteration
        theMap.objectTree.clear();
    }
}

// Worker Thread Update Function
// Update Approximately 66 Times Each Second
function updateWorker() {
    let currentTime, delta;
    while (1) {
        currentTime = new Date().getTime();
        delta = (currentTime - lastTime) / 1000;
        if (delta > 0.015) {
            workerLoop(delta);
            lastTime = currentTime;
            break;
        }
    }

    // Execute updateWorker Function Asynchronously
    setImmediate(updateWorker);
}

// Worker Thread New Object Function
function newObject(data) {
    let theObject = data.theObject;

    if (allObject.list.length <= theObject.ID) allObject.list.length = theObject.ID + 1000;
    allObject.list[theObject.ID] = theObject;

    // setPrototypeOf Is A Static Method Sets Prototype Of A Specific Object To Another Object
    switch(theObject.objectType) {
        case "projectile":
            Object.setPrototypeOf(theObject, projectile.prototype);
            break;

        case "AI":
            Object.setPrototypeOf(theObject, AI.prototype);
            break;

        case "player":
            Object.setPrototypeOf(theObject, player.prototype);
            break;
    }

    // Initialize Object Worker
    theObject.initWorker();
}

// Worker Thread Listen To Parent Thread Events
parentPort.on('message', (data) => {
    switch(data.type){
        // Create New Object
        case "newObject":
            newObject(data);
            return;

        // Remove Object
        case "deleteObject":
            let theObject = allObject.list[data.ID];
            if (theObject == null) return;
            theObject.removeOnWorker();
            return;

        // Update Worker Thread
        case "update":
            updateWorker();
            return;

        // Initialize Worker Thread
        case "init":
            initWorker(data);
            return;
    }
})