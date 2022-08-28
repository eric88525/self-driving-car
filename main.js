const canvas = document.getElementById("myCanvas");
canvas.width = 200;

// canvas reference
// https://www.w3schools.com/tags/ref_canvas.asp
const ctx = canvas.getContext("2d");

// objects
const road = new Road(canvas.width / 2, canvas.width*0.9);
const car = new Car(road.getLaneCenter(1), 100, 30, 50, "AI", 3);

const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2)
]

animate();

function animate() {

    for(let i=0;i<traffic.length;i++)
        traffic[i].update(road.borders, []);

    car.update(road.borders, traffic);
    canvas.height = window.innerHeight;

    // Saves the state of the current context
    ctx.save();
    // Let the car stay in the center
    ctx.translate(0, -car.y + canvas.height*0.5);

    road.draw(ctx);

    for(let i=0;i<traffic.length;i++)
        traffic[i].draw(ctx, "red");

    car.draw(ctx, "blue");

    // Returns previously saved path state and attributes
    ctx.restore();

    requestAnimationFrame(animate);
}
