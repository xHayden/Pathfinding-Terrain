let currentImage = "georgia"

function runPathfinding() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1081;
    canvas.height = 1081;
    let gridWidth = 1081;
    let gridHeight = 1081;
    function getPathableArea(ctx, dim) {
        let imageMatrix = new Array((dim ** 2) * 4);
        let xCounter = 0;
        let yCounter = 0;
        let margin = 0.05;
        let diffusionSize = 1;
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
        let trueCounter = 0;
        let falseCounter = 0;
        for (let i = 0; i < (dim ** 2); i++) {
            try {
                    imageMatrix[i * 4 + 3] =
                        (isNaN(imageMatrix[i * 4 + 2]) || isNaN(imageMatrix[((i - 1) * 4) + 2]) ? true : (Math.abs(imageMatrix[i * 4 + 2] - imageMatrix[((i - 1) * 4) + 2]) < margin)) &&
                        (isNaN(imageMatrix[i * 4 + 2]) || isNaN(imageMatrix[((i + 1) * 4) + 2]) ? true : (Math.abs(imageMatrix[i * 4 + 2] - imageMatrix[((i + 1) * 4) + 2]) < margin)) &&
                        (isNaN(imageMatrix[i * 4 + 2]) || isNaN(imageMatrix[((i+dim) * 4) + 2]) ? true : (Math.abs(imageMatrix[i * 4 + 2] - imageMatrix[((i + dim) * 4) + 2]) < margin)) && 
                        (isNaN(imageMatrix[i * 4 + 2]) || isNaN(imageMatrix[((i-dim) * 4) + 2]) ? true : (Math.abs(imageMatrix[i * 4 + 2] - imageMatrix[((i - dim) * 4) + 2]) < margin))
                        // if one of the positions in front or behind the particle is NaN, then just assume that that condition is met.
                        // otherwise, check if each particles difference in height is smaller than the margin.
                        // wait. here's the problem with this logic.
                        // you need all of the directions to be usable to be able to move. aaaa I don't have time to fix this...
                        // it should only need to check the direction the particle wants to move, but that is implemented at the pathfinding algorithm level
                        // how can I fix it from this? I don't think I can. That has to be a limitation, I guess.
                imageMatrix[i * 4 + 3] ? trueCounter++ : falseCounter++
            }
            catch (e) {
                console.error(e)
            }
        }
        console.log(trueCounter, falseCounter)
        return imageMatrix;
    }
    let dim = 1080;
    ctx.clearRect(0, 0, ctx.width, ctx.height);
    let heightmapImage = new Image();
    heightmapImage.src = `images/${currentImage}.png`;
    heightmapImage.onload = () => {
        ctx.drawImage(heightmapImage, 0, 0);
        pointData = getPathableArea(ctx, (dim+1));
        var grid = new PF.Grid(gridWidth, gridHeight);
        for (let i = 0; i < ((dim + 1) ** 2); i++) {
            grid.setWalkableAt(pointData[i * 4 + 0], pointData[i * 4 + 1], pointData[i * 4 + 3]);
        }
        var finder = new PF.AStarFinder({
            allowDiagonal: true
        });
        var path = finder.findPath(1, 1, dim, dim, grid);
        ctx.fillStyle = 'green';
        for (let i in path) {
            let node = path[i];
            ctx.fillRect(node[0], node[1], 5, 5);
        }
        document.getElementById("results").innerText = `Path length: ${path.length}`
        console.log("Path length: " + path.length);
        console.log(`Image width: ${dim}`);
        console.log("Ratio: " + path.length/dim);
    }
}

document.addEventListener('DOMContentLoaded', () => {+
    runPathfinding();
    document.getElementById("button").onclick = (e) => {
        e.preventDefault();
        currentImage = document.getElementById("heightmap-select").value;
        runPathfinding();
    }
})

