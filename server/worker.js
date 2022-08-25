
var workerMapList, workerIndex, workerNumber;

const {
    parentPort,
} = require('worker_threads')




var {map, mapList, unitModifiedList} = require('./mapClass.js');
const {object, sphere, allObject} = require('./object.js');
const {player, AI, properties, allPlayer, defaultProperties} = require('./serverCreature.js');
const {projectile, projectileRemoveList} = require('./serverProjectile.js');

var lastTime = new Date().getTime();

function initWorker(data){
    workerIndex = data.workerIndex;
    workerNumber = data.workerNumber;

    workerMapList = data.workerMapList;
    for (let i = 0; i < workerMapList.length; ++i){
        Object.setPrototypeOf(workerMapList[i], map.prototype);
        workerMapList[i].initWorkerMap();
    }

    parentPort.postMessage({type: "init"})
}


function workerLoop(delta){
    let i, j, theProjectile, thePlayer, theMap;
    for (i = 0; i < workerMapList.length; ++i){
        theMap = workerMapList[i];
        unitModifiedList.length = 0;
        projectileRemoveList.length = 0;

        // Add Projectile Into The Tree
        for(j = 0; j < theMap.projectileIDArray.length[0]; ++j) {
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


        // Add Player Into The Tree
        for(j = 0; j < theMap.playerIDArray.length[0]; ++j) {
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






        // Player Update
        for(j = 0; j < theMap.playerIDArray.length[0]; ++j) {
            thePlayer = allObject.list[theMap.playerIDArray.list[j]];

            if (thePlayer == null) continue;

            thePlayer.update();
        }
        


        if (unitModifiedList.length != 0 ||
            projectileRemoveList.length != 0 ){

            parentPort.postMessage({
                type: "updateMap",
                mapIndex: theMap.index,
                unitModifiedList: unitModifiedList,
                projectileRemoveList: projectileRemoveList
            })
        }

        theMap.objectTree.clear();
    }
    


}


function updateWorker(){
    let currentTime, delta;
    while (1){
        currentTime = new Date().getTime();
        delta = (currentTime - lastTime) / 1000;
        if (delta > 0.015){
            workerLoop(delta);
            lastTime = currentTime;
            break;
        }
    }

    setImmediate(updateWorker);
}


function newObject(data){
    let theObject = data.theObject;

    if (allObject.list.length <= theObject.ID) allObject.list.length = theObject.ID + 1000;
    allObject.list[theObject.ID] = theObject;

    switch(theObject.objectType){
        case "projectile":
            Object.setPrototypeOf(theObject, projectile.prototype);
            break;

        case "player":
            Object.setPrototypeOf(theObject, player.prototype);
            break;
    }

    theObject.initWorker();

}

parentPort.on('message', (data) => {
    switch(data.type){
        case "newObject":
            newObject(data);
            return;
        case "deleteObject":
            let theObject = allObject.list[data.ID];
            if (theObject == null) return;
            theObject.removeOnWorker();
            return;
        case "update":
            updateWorker();
            return;
        case "init":
            initWorker(data);
            return;
    }
})