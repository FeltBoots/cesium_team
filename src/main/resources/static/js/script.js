Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1ZGQ5ODgxYS1lNDJjLTQxYTItYTE5OS0wOGU0ZTJmZmNkOTAiLCJpZCI6NjQyMywic2NvcGVzIjpbImFzbCIsImFzciIsImFzdyIsImdjIl0sImlhdCI6MTU0NjQ4Mjc4MH0.z8QhrB2OZesuaxrmntJBykfaeMHyUXxwGXhdBCE1NT0';

var viewer = new Cesium.Viewer('cesiumContainer', {
    // infoBox : false,
    // selectionIndicator : false,
    shadows : true,
    shouldAnimate : true
});

function getColorBlendMode(colorBlendMode) {
    return Cesium.ColorBlendMode[colorBlendMode.toUpperCase()];
}

function getColor(colorName, alpha) {
    var color = Cesium.Color[colorName.toUpperCase()];
    return Cesium.Color.fromAlpha(color, parseFloat(alpha));
}

var viewModel = {
    color : 'Red',
    colors : ['White', 'Red', 'Green', 'Blue', 'Yellow', 'Gray'],
    alpha : 1.0,
    colorBlendMode : 'Highlight',
    colorBlendModes : ['Highlight', 'Replace', 'Mix'],
    colorBlendAmount : 0.5,
    colorBlendAmountEnabled : false,
    modelEnabled : false,
    silhouetteColor : 'Red',
    silhouetteColors : ['Red', 'Green', 'Blue', 'Yellow', 'Gray'],
    silhouetteAlpha : 1.0,
    silhouetteSize : 2.0,
    position : { x : 0, y : 0,  z : 0 },
};

Cesium.knockout.track(viewModel);

var toolbar = document.getElementById('toolbar');
var shapeEditMenu = document.getElementById('shapeEditMenu');

Cesium.knockout.applyBindings(viewModel, toolbar);

Cesium.knockout.getObservable(viewModel, 'color').subscribe(
    function(newValue) {
        if (entity.point)
            entity.point.color = getColor(newValue, viewModel.alpha);
        else
            entity.model.color = getColor(newValue, viewModel.alpha);
    }
);

Cesium.knockout.getObservable(viewModel, 'alpha').subscribe(
    function(newValue) {
        if (entity.point)
            entity.point.color = getColor(viewModel.color, newValue);
        else
            entity.model.color = getColor(viewModel.color, newValue);
    }
);

Cesium.knockout.getObservable(viewModel, 'colorBlendMode').subscribe(
    function(newValue) {
        var colorBlendMode = getColorBlendMode(newValue);
        entity.model.colorBlendMode = colorBlendMode;
        viewModel.colorBlendAmountEnabled = (colorBlendMode === Cesium.ColorBlendMode.MIX);
    }
);

Cesium.knockout.getObservable(viewModel, 'colorBlendAmount').subscribe(
    function(newValue) {
        entity.model.colorBlendAmount = parseFloat(newValue);
    }
);

Cesium.knockout.getObservable(viewModel, 'silhouetteColor').subscribe(
    function(newValue) {
        entity.model.silhouetteColor = getColor(newValue, viewModel.silhouetteAlpha);
    }
);

Cesium.knockout.getObservable(viewModel, 'silhouetteAlpha').subscribe(
    function(newValue) {
        entity.model.silhouetteColor = getColor(viewModel.silhouetteColor, newValue);
    }
);

Cesium.knockout.getObservable(viewModel, 'silhouetteSize').subscribe(
    function(newValue) {
        entity.model.silhouetteSize = parseFloat(newValue);
    }
);

var path = '../Cesium/Apps/';

var options = [ {
    text : 'Aircraft',
    onselect : function() {
        addEntity(lastClickedPosition, path + '/SampleData/models/CesiumAir/Cesium_Air.glb');
    }
}, {
    text : 'Ground Vehicle',
    onselect : function() {
        addEntity(lastClickedPosition, path + '/SampleData/models/GroundVehicle/GroundVehicle.glb');
    }
}, {
    text : 'Hot Air Balloon',
    onselect : function() {
        addEntity(lastClickedPosition, path + '/SampleData/models/CesiumBalloon/CesiumBalloon.glb');
    }
}, {
    text : 'Milk Truck',
    onselect : function() {
        addEntity(lastClickedPosition, path + '/SampleData/models/CesiumMilkTruck/CesiumMilkTruck-kmc.glb');
    }
}, {
    text : 'Skinned Character',
    onselect : function() {
        addEntity(lastClickedPosition, path + '/SampleData/models/CesiumMan/Cesium_Man.glb');
    }
}, {
    text : 'point',
    onselect : function() {
        addEntity(lastClickedPosition);
    }
}];


function add() {
    var select = document.getElementsByTagName("select")[3];
    var value = select.options[select.selectedIndex].text;
    console.log(value);
}

Sandcastle.addToolbarMenu(options, 'shapeEditMenu');

// Sandcastle.addToolbarButton('Add', add, 'shapeEditMenu');

Sandcastle.addToggleButton('Shadows', viewer.shadows, function(checked) {
    viewer.shadows = checked;
});


// change params
function addEntity(Cartesian, url, isPointPrimitive = !url) {
    Sandcastle.declare(addEntity);

    var heading = Cesium.Math.toRadians(135); // for some reason
    var pitch = 0;
    var roll = 0;
    var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    var orientation = Cesium.Transforms.headingPitchRollQuaternion(Cartesian, hpr);

    if (isPointPrimitive) {
        entity = viewer.entities.add({

            name: "point",
            position: Cartesian,
            orientation: orientation,

            point: {
                id : generate_id(),
                pixelSize: 10,
                color: getColor(viewModel.color, viewModel.alpha),
                scaleByDistance: new Cesium.NearFarScalar(1.5e2, 5.0, 5.5e7, 0.0),
                translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 0.5, 1.5e7, 1.0),
            }

        });
    } else {
        entity = viewer.entities.add({

            name : "model",
            position : Cartesian,
            orientation : orientation,

            model : {
                uri : url,
                id : generate_id(),
                minimumPixelSize : 128,
                maximumScale : 20000,
                color : getColor(viewModel.color, viewModel.alpha),
                colorBlendMode : getColorBlendMode(viewModel.colorBlendMode),
                colorBlendAmount : parseFloat(viewModel.colorBlendAmount),
                silhouetteColor : getColor(viewModel.silhouetteColor, viewModel.silhouetteAlpha),
                silhouetteSize : parseFloat(viewModel.silhouetteSize)
            }


        });
    }
}

var count = 0;
function generate_id() {
    return count++;
}

var entity;
var lastClickedPosition;
var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

handler.setInputAction(function(e) {
    var shapeEditMenu = document.getElementById("shapeEditMenu");
    shapeEditMenu.style.display = "block";
    shapeEditMenu.style.left = e.position.x + 'px';
    shapeEditMenu.style.top = e.position.y + 'px';
    var cartesian = viewer.camera.pickEllipsoid(e.position, viewer.scene.globe.ellipsoid);
    lastClickedPosition = cartesian;
}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

handler.setInputAction(function() {
    var shapeEditMenu = document.getElementById("shapeEditMenu");
    shapeEditMenu.style.display = "none";
}, Cesium.ScreenSpaceEventType.LEFT_DOWN);

handler.setInputAction(function(click) {
    var picked = viewer.scene.pick(click.position);

    if (Cesium.defined(picked)) {
        var id = Cesium.defaultValue(picked.id, picked.primitive.id);
        if (id instanceof Cesium.Entity) {
            entity = id;
            viewModel.modelEnabled = entity.name === "model";
        }
    }

}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

