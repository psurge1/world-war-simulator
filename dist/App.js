(() => {
  // src/App.ts
  var conqueredCount = 0;
  var matrixOneIsMain = true;
  var width = 501;
  var height = 251;
  var gamePixelWidth = 3;
  var gamePixelHeight = 3;
  window.setup = () => {
    createCanvas(width * gamePixelWidth, height * gamePixelHeight);
    background(0);
  };
  window.draw = () => {
    if (matrixOneIsMain) {
        // timeStep(world_map_matrix_two, world_map_matrix_one, countries, boats);
        background(0);
        // drawMap(screen, world_map_matrix_two, boats, False, old_world_map_matrix=world_map_matrix_one);
        matrixOneIsMain = false;
    }
    else {
        // timeStep(world_map_matrix_one, world_map_matrix_two, countries, boats);
        background(0);
        // drawMap(screen, world_map_matrix_one, boats, False, old_world_map_matrix=world_map_matrix_two);
        matrixOneIsMain = true;
    }
  };
})();
