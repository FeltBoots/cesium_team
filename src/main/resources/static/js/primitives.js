function addPoint(Cartesian) {
    Sandcastle.declare(addPoint);

    viewer.entities.add({
        position : Cartesian,
        point : {
            pixelSize : 10,
            color : Cesium.Color.YELLOW
        }
    });
}

var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

handler.setInputAction(function(e) {

    var shapeEditMenu = document.getElementById("shapeEditMenu");
    // shapeEditMenu.textContent = 'Testing';

    shapeEditMenu.style.display = "block";
    shapeEditMenu.style.left = e.position.x + 'px';
    shapeEditMenu.style.top = e.position.y + 'px';


    var cartesian = viewer.camera.pickEllipsoid(e.position, viewer.scene.globe.ellipsoid);

    //TODO: Add combobox for entity selection
    addPoint(cartesian);

}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

handler.setInputAction(function(e) {
    var shapeEditMenu = document.getElementById("shapeEditMenu");
    shapeEditMenu.style.display = "none";
}, Cesium.ScreenSpaceEventType.LEFT_DOWN);

