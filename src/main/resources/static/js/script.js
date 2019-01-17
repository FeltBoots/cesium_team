Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1ZGQ5ODgxYS1lNDJjLTQxYTItYTE5OS0wOGU0ZTJmZmNkOTAiLCJpZCI6NjQyMywic2NvcGVzIjpbImFzbCIsImFzciIsImFzdyIsImdjIl0sImlhdCI6MTU0NjQ4Mjc4MH0.z8QhrB2OZesuaxrmntJBykfaeMHyUXxwGXhdBCE1NT0';

var viewer = new Cesium.Viewer('cesiumContainer', {
    shadows : true,
    shouldAnimate : true
});

var currViewModel = {
    color : 'Red',
    colors : ['Red', 'White', 'Green', 'Blue', 'Yellow', 'Gray'],
    alpha : 1.0,
    colorBlendMode : 'Highlight',
    colorBlendModes : ['Highlight', 'Replace', 'Mix'],
    colorBlendAmount : 0.5,
    colorBlendAmountEnabled : false,
    positionEnabled: false,
    modelEnabled : false,
    silhouetteColor : 'Red',
    silhouetteColors : ['Red', 'Green', 'Blue', 'Yellow', 'Gray'],
    silhouetteAlpha : 1.0,
    silhouetteSize : 2.0,
    position : { x : 0, y : 0,  z : 0 },
  //  longitude : 0,
  // latitude : 0
};

Cesium.knockout.track(currViewModel);

var model = Object.create(currViewModel);

var entity;

var lastClickedPosition;

var viewModels = {};

var toolbar = document.getElementById('toolbar');
var shapeEditMenu = document.getElementById('shapeEditMenu');

var path = '../Cesium/Apps/';

var options = [ {
    text : 'default',
    onselect : function () {
        //...
    }
}, {
    text : 'Aircraft',
    onselect : function() {
        addEntity(lastClickedPosition, path + '/SampleData/models/CesiumAir/Cesium_Air.glb');
        chooseDefaultOptionAndShowToolbar();
    }
}, {
    text : 'Ground Vehicle',
    onselect : function() {
        addEntity(lastClickedPosition, path + '/SampleData/models/GroundVehicle/GroundVehicle.glb');
        chooseDefaultOptionAndShowToolbar();
    }
}, {
    text : 'Hot Air Balloon',
    onselect : function() {
        addEntity(lastClickedPosition, path + '/SampleData/models/CesiumBalloon/CesiumBalloon.glb');
        chooseDefaultOptionAndShowToolbar();
    }
}, {
    text : 'Milk Truck',
    onselect : function() {
        addEntity(lastClickedPosition, path + '/SampleData/models/CesiumMilkTruck/CesiumMilkTruck-kmc.glb');
        chooseDefaultOptionAndShowToolbar();
    }
}, {
    text : 'Skinned Character',
    onselect : function() {
        addEntity(lastClickedPosition, path + '/SampleData/models/CesiumMan/Cesium_Man.glb');
        chooseDefaultOptionAndShowToolbar();
    }
}, {
    text : 'point',
    onselect : function() {
        addEntity(lastClickedPosition);
        chooseDefaultOptionAndShowToolbar();
    }
}];

function chooseDefaultOptionAndShowToolbar(){
    document.getElementById('shapeEditMenu').firstChild.selectedIndex = "0";
    document.getElementById('toolbar').style.visibility = "visible";
}


function getColorBlendMode(colorBlendMode) {
    return Cesium.ColorBlendMode[colorBlendMode.toUpperCase()];
}

function getColor(colorName, alpha) {
    var color = Cesium.Color[colorName.toUpperCase()];
    return Cesium.Color.fromAlpha(color, parseFloat(alpha));
}

function getNewViewModel() {
    var a = {};
    for(var k in model) a[k]=model[k];
    return a;
}

function initViewModelMenu() {
    toolbar.style.display = "block";
}

Sandcastle.addToolbarMenu(options, 'shapeEditMenu');
Sandcastle.addToolbarButton('Delete', function() {
        if (Cesium.defined(entity)) {
            if (confirm("Delete dot selected?")) {
                viewer.entities.remove(entity);
                if (viewer.entities.values.length > 0) {
                    entity = viewer.entities.values[0];
                } else {
                    entity = undefined;
                }
            }
        }
    }
    , 'shapeEditMenu');
Sandcastle.addToggleButton('Shadows', viewer.shadows, function(checked) {
    viewer.shadows = checked;
});

function bindViewModel(viewModel) {
    Cesium.knockout.cleanNode(toolbar);
    Cesium.knockout.applyBindings(viewModel, toolbar);

    initViewModelMenu();

    Cesium.knockout.getObservable(viewModel, 'color').subscribe(
        function (newValue) {
            if (entity.point)
                entity.point.color = getColor(newValue, viewModel.alpha);
            else
                entity.model.color = getColor(newValue, viewModel.alpha);
            entity.color_model = newValue;
        }
    );

    Cesium.knockout.getObservable(viewModel, 'alpha').subscribe(
        function (newValue) {
            if (entity.point)
                entity.point.color = getColor(viewModel.color, newValue);
            else
                entity.model.color = getColor(viewModel.color, newValue);
            entity.alpha_model = newValue;
        }
    );

    Cesium.knockout.getObservable(viewModel, 'colorBlendMode').subscribe(
        function (newValue) {
            var colorBlendMode = getColorBlendMode(newValue);
            entity.model.colorBlendMode = colorBlendMode;
            viewModel.colorBlendAmountEnabled = (colorBlendMode === Cesium.ColorBlendMode.MIX);
            entity.colorBlendMode_model = newValue;
        }
    );

    Cesium.knockout.getObservable(viewModel, 'colorBlendAmount').subscribe(
        function (newValue) {
            entity.model.colorBlendAmount = parseFloat(newValue);
            entity.colorBlendAmount_model = newValue;
        }
    );

    Cesium.knockout.getObservable(viewModel, 'silhouetteColor').subscribe(
        function (newValue) {
            entity.model.silhouetteColor = getColor(newValue, viewModel.silhouetteAlpha);
            entity.silhouetteColor_model = newValue;
        }
    );

    Cesium.knockout.getObservable(viewModel, 'silhouetteAlpha').subscribe(
        function (newValue) {
            entity.model.silhouetteColor = getColor(viewModel.silhouetteColor, newValue);
            entity.silhouetteAlpha_model = newValue;
        }
    );

    Cesium.knockout.getObservable(viewModel, 'silhouetteSize').subscribe(
        function (newValue) {
            entity.model.silhouetteSize = parseFloat(newValue);
            entity.silhouetteSize_model = newValue;
        }
    );
    /*
    Cesium.knockout.getObservable(viewModel, 'position').subscribe(
    function(newValue) {
        entity.model.position = newValue;
        var cartographic = Cesium.Cartographic.fromCartesian(newValue);
        entity.longitude_model = cartographic.longitude;
        entity.longitude_model = cartographic.latitude;
    }
);

    Cesium.knockout.getObservable(viewModel, 'longitude').subscribe(
        function(newValue) {
             if (entity.position == undefined) {
                 entity.position = Cesium.Cartesian3(newValue, 0, 0);
             } else {
                 var cartographic = Cesium.Cartographic.fromCartesian(viewer.camera.pickEllipsoid(entity.position, viewer.scene.globe.ellipsoid));
                 entity.position = Cesium.Cartesian3(newValue, cartographic.latitude, 0);
             }
         }
        }
    );

    Cesium.knockout.getObservable(viewModel, 'latitude').subscribe(
        function(newValue) {
            if (entity.position == undefined) {
                entity.position = Cesium.Cartesian3(0, newValue, 0);
            } else {
                var cartographic = Cesium.Cartographic.fromCartesian(viewer.camera.pickEllipsoid(entity.position, viewer.scene.globe.ellipsoid));
                entity.position = Cesium.Cartesian3(cartographic.longitude, newValue, 0);
            }
        }
        }
    );*/
}

function addEntity(Cartesian, url, isPointPrimitive) {
    isPointPrimitive = !url;
    Sandcastle.declare(addEntity);

    var heading = Cesium.Math.toRadians(135);
    var pitch = 0;
    var roll = 0;
    var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    var orientation = Cesium.Transforms.headingPitchRollQuaternion(Cartesian, hpr);

    var id = generate_id();
    viewModels[id] = getNewViewModel();
    currViewModel = viewModels[id];
    Cesium.knockout.track(currViewModel);

    if (isPointPrimitive) {
        entity = viewer.entities.add({
            name: "point",
            position: Cartesian,//Cesium.Cartesian3.fromDegrees(viewModel.longitude, viewModel.latitude, 0),
            orientation: orientation,
            id : id,

            /* Properties for updating toolbar */
            color_model: viewModels[id].color,
            alpha_model: viewModels[id].alpha,

            point: {
                pixelSize: 10,
                color: getColor(viewModels[id].color, viewModels[id].alpha),
                scaleByDistance: new Cesium.NearFarScalar(1.5e2, 5.0, 5.5e7, 0.0),
                translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 0.5, 1.5e7, 1.0),
            }
        });
    } else {
        entity = viewer.entities.add({
            name : "model",
            position : Cartesian,//Cesium.Cartesian3.fromDegrees(viewModel.longitude, viewModel.latitude, 0),
            orientation : orientation,
            id : id,

            /* Properties for updating toolbar */
            color_model: viewModels[id].color,
            alpha_model: viewModels[id].alpha,
            colorBlendMode_model: viewModels[id].colorBlendMode,
            colorBlendAmount_model : viewModels[id].colorBlendAmount,
            silhouetteColor_model : viewModels[id].silhouetteColor,
            silhouetteAlpha_model : viewModels[id].silhouetteAlpha,
            silhouetteSize_model : viewModels[id].silhouetteSize,
            /*longitude_model : viewModel.longitude,
            latitude_model : viewModel.latitude,*/

            model : {
                uri : url,
                minimumPixelSize : 128,
                maximumScale : 20000,
                color : getColor(viewModels[id].color, viewModels[id].alpha),
                colorBlendMode : getColorBlendMode(viewModels[id].colorBlendMode),
                colorBlendAmount : parseFloat(viewModels[id].colorBlendAmount),
                silhouetteColor : getColor(viewModels[id].silhouetteColor, viewModels[id].silhouetteAlpha),
                silhouetteSize : parseFloat(viewModels[id].silhouetteSize),
                /*longitude : viewModel.longitude,
                latitude : viewModel.latitude,*/
            }
        });
    }
    bindViewModel(currViewModel);
    currViewModel.modelEnabled = entity.name === "model";
}

var count = 0;
function generate_id() {
    return ++count;
}

var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

handler.setInputAction(function(e) {
    var shapeEditMenu = document.getElementById("shapeEditMenu");
    shapeEditMenu.style.display = "block";
    shapeEditMenu.style.left = e.position.x + 'px';
    shapeEditMenu.style.top = e.position.y + 'px';
    lastClickedPosition = viewer.camera.pickEllipsoid(e.position, viewer.scene.globe.ellipsoid);
}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

handler.setInputAction(function() {
    var shapeEditMenu = document.getElementById("shapeEditMenu");
    shapeEditMenu.style.display = "none";
}, Cesium.ScreenSpaceEventType.LEFT_DOWN);

function setSelectedOption(id, newValue) {
    var select = document.getElementById(id);
    var options = select.getElementsByTagName('option');
    for (var i = 0; i < options.length; i++) {
        if (options[i].value === newValue) {
            select.getElementsByTagName('option')[i].selected = 'selected';
        }
    }
}

function setInputValue(id, newValue) {
    var inputs = document.getElementById(id).childNodes;
    for (var i = 0; i < inputs.length; i++)
        inputs[i].value = newValue;
}


function changeMenuValue(property, newValue) {
    switch (property) {
        case 'color':
            setSelectedOption('color-model', newValue);
            break;
        case 'alpha':
            setInputValue('alpha-model', newValue);
            break;
        case 'colorBlendMode':
            setSelectedOption('mode-model', newValue);
            break;
        case 'colorBlendAmount':
            setInputValue('colorBlendAmount-model', newValue);
            break;
        case 'silhouetteColor':
            setSelectedOption('silhouetteColors-model', newValue);
            break;
        case 'silhouetteAlpha':
            setInputValue('silhouetteAlpha-model', newValue);
            break;
        case 'silhouetteSize':
            setInputValue('silhouetteSize-model', newValue);
            break;
        /*case 'longitude':
            setPositionValue('longitude-model', newValue);
            break;
        case 'latitude':
            setPositionValue('latitude-model', newValue);
            break;*/
    }
}

handler.setInputAction(function(click) {
    var picked = viewer.scene.pick(click.position);
    if (Cesium.defined(picked)) {
        var id = Cesium.defaultValue(picked.id, picked.primitive.id);
        if (id instanceof Cesium.Entity && entity.id !== id.id) {
            entity = id;
            currViewModel = viewModels[entity.id];
            for (var prop in currViewModel) {
                if (entity[prop + '_model'])
                    changeMenuValue(prop, entity[prop + '_model']);
            }
            currViewModel.modelEnabled = entity.name === "model";
            currViewModel.colorBlendAmountEnabled = entity.name === "model" &&
                entity.colorBlendAmount === "MIX";
        }
    }

}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

