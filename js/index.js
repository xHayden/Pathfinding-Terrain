const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
var heightmapImg = document.getElementById("heightmap");
canvas.width = 1081;
canvas.height = 1081;

let gridWidth = 1081;
let gridHeight = 1081;

function getPathableArea(ctx, dim) {
    let imageMatrix = new Array((dim ** 2) * 4);
    let xCounter = 0;
    let yCounter = 0;
    let margin = 0.005;
    let diffusionSize = 5;
    for (let i = 0; i < imageMatrix.length; i++) {
        switch (i % 4) {
            case 0:
                if (xCounter === dim) {
                    xCounter = 0;
                    yCounter++;
                }
                imageMatrix[i] = xCounter++;
                break;
            case 1:
                imageMatrix[i] = yCounter;
                break;
            case 2:
                let colorData = ctx.getImageData(xCounter + 1, yCounter + 1, diffusionSize, diffusionSize).data;
                let diffuseAccumulator = 0;
                for (let j = 0; j < (diffusionSize ** 2); j++) {
                    diffuseAccumulator += colorData[j * 4];
                }
                imageMatrix[i] = diffuseAccumulator / (diffusionSize ** 2) / 255;
                break;
            case 3:
                break;
        }
    }
    for (let i = 0; i < (dim ** 2); i++) {
        try {
            if (i > 0 && i < (dim ** 2)) { // sorry first and last position, speed is more important :(
                imageMatrix[i * 4 + 3] =
                    !(Math.abs(imageMatrix[i * 4 + 2] - imageMatrix[((i - 1) * 4) + 2]) > margin) ||
                    !(Math.abs(imageMatrix[i * 4 + 2] - imageMatrix[((i + 1) * 4) + 2]) > margin)

            }

        }
        catch (e) {
            console.error(e)
        }
    }
    return imageMatrix;
}

heightmapImg.onload = function () {
    ctx.drawImage(heightmapImg, 0, 0);
    var p = ctx.getImageData(1, 1, 1, 1).data;
    pointData = getPathableArea(ctx, 1081);
    var grid = new PF.Grid(gridWidth, gridHeight);
    for (let i = 0; i < (1081 ** 2); i++) {
        grid.setWalkableAt(pointData[i * 4 + 0], pointData[i * 4 + 1], pointData[i * 4 + 3]);
    }
    var finder = new PF.AStarFinder({
        allowDiagonal: true
    });
    var path = finder.findPath(1, 1, 1080, 1080, grid);
    ctx.fillStyle = 'green';
    for (let i in path) {
        let node = path[i];
        ctx.fillRect(node[0], node[1], 5, 5);
    }
}