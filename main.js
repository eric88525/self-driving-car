const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;

const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

// canvas reference
// https://www.w3schools.com/tags/ref_canvas.asp
const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");
// objects
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

const carWidth = 30;
const carHeight = 60;

ALGORITHM = "beamSearch";

const K = 5;
const N = 1000;
const cars = generateCars(N);
let bestCar = cars[0];
let topK = [];

if (localStorage.getItem("bestBrain")) {
    if (ALGORITHM == "beamSearch") {
        let childCount = N / K;
        topK = JSON.parse(localStorage.getItem("bestBrain"));
        for (let i = 0; i < K; i++) {
            let base = i * childCount;
            for (let j = 0; j < childCount; j++) {
                cars[base + j].brain = JSON.parse(JSON.stringify(topK[i]));
                if (j != 0) {
                    NeuralNetwork.mutate(cars[base + j].brain, 0.2);
                }
            }
        }
    } else if (ALGORITHM == "geneticAlgorithm") {
        for (let i = 0; i < cars.length; i++) {
            cars[i].brain = JSON.parse(
                localStorage.getItem("bestBrain"));
            if (i != 0) {
                NeuralNetwork.mutate(cars[i].brain, 0.1);
            }
        }
    }
}

let traffic = [
    new Car(road.getLaneCenter(1), -100, carWidth, carHeight, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(0), -300, carWidth, carHeight, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(2), -300, carWidth, carHeight, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(0), -500, carWidth, carHeight, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(1), -500, carWidth, carHeight, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(1), -700, carWidth, carHeight, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(2), -700, carWidth, carHeight, "DUMMY", 2, getRandomColor()),
];

// randomly generate traffic
for (let i = -1000; i > -10000; i -= 300) {
    traffic = traffic.concat(generateTraffics(i, 3));
}

function generateTraffics(basePosition, roadWidth) {
    const cars = [];
    let arr = [];

    for(let i=0; i<roadWidth; i++) {
        arr.push(i)
    }

    let randomPosition = getMultipleRandom(arr, roadWidth-1);

    for (let pos of randomPosition) {
        console.log(pos);
        cars.push(
            new Car(
                road.getLaneCenter(pos),
                basePosition,
                carWidth,
                carHeight,
                "DUMMY",
                2,
                getRandomColor()));
    }

    return cars;
}

function generateCars(N) {
    const cars = [];
    for (let i = 1; i <= N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, carWidth, carHeight, "AI"));
    }
    return cars;
}

function save() {
    if (ALGORITHM == "beamSearch") {
        let sortArray = cars.sort(function (a, b) { return a.y - b.y }).slice(0, K);
        for (let i = 0; i < K; i++) {
            topK[i] = sortArray[i].brain;
        }
        localStorage.setItem("bestBrain",
            JSON.stringify(topK));
    } else if (ALGORITHM == "geneticAlgorithm") {
        localStorage.setItem("bestBrain",
            JSON.stringify(bestCar.brain));
    }
}

function discard() {
    localStorage.removeItem("bestBrain");
}

function reload() {
    location.reload();
}

animate();



function animate(time) {

    for (let i = 0; i < traffic.length; i++)
        traffic[i].update(road.borders, []);

    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }

    bestCar = cars.find(
        c => c.y == Math.min(...cars.map(c => c.y))
    );

    console.log(bestCar.sensor.readings);

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    // Saves the state of the current context
    carCtx.save();
    // Let the car stay in the center
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

    road.draw(carCtx);

    for (let i = 0; i < traffic.length; i++) {
        if (i > 6) {
            traffic[i].draw(carCtx);
        } else {
            traffic[i].draw(carCtx, "red");
        }
    }

    carCtx.globalAlpha = 0.2;

    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx, "blue");
    }

    carCtx.globalAlpha = 1;

    bestCar.draw(carCtx, "blue", true);
    // Returns previously saved path state and attributes
    carCtx.restore();

    networkCtx.lineDashOffset = -time / 50;

    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(animate);
}
