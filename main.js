const canvas = document.getElementById("myCanvas");
canvas.width = 200;

// canvas reference
// https://www.w3schools.com/tags/ref_canvas.asp
const ctx = canvas.getContext("2d");

// objects
const road = new Road(canvas.width / 2, canvas.width);
const car = new Car(road.getLaneCenter(1), 100, 30, 50);


animate();

function animate() {
    car.update();
    canvas.height = window.innerHeight;

    // Let the car stay in the center
    ctx.translate(0, -car.y + canvas.height*0.5);

    road.draw(ctx);
    car.draw(ctx);

    // Saves the state of the current context
    ctx.save();
    // Returns previously saved path state and attributes
    ctx.restore();

    requestAnimationFrame(animate);
}
