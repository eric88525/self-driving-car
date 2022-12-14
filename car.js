class Car {
    constructor(x, y, width, height, controlType, maxSpeed = 5, color="red") {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = 0.3;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damage = false;
        this.color=color;

        this.useBrain = controlType == "AI";

        if (controlType != "DUMMY") {
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 6, 4]);
        }
        this.img = new Image();

        if(controlType=="AI"){
            this.img.src = "aiCar.png";
        }else{
            this.img.src = "trafficCar.png";
        }
       
        this.controls = new Controls(controlType);
    }

    update(roadBorders, traffic) {
        if (!this.damage) {
            this.#move();
            this.polygon = this.#createPolygon();
            this.damage = this.#assessDamage(roadBorders, traffic);
            if (this.sensor) {
                this.sensor.update(roadBorders, traffic);
                // The signal will be stronger if the sensor detects an object is closer to the car
                const offsets = this.sensor.readings.map(
                    s => s == null ? 0 : 1 - s.offset
                );
                const outputs = NeuralNetwork.feedForward(offsets, this.brain);
                //console.log(outputs);

                if (this.useBrain) {
                    this.controls.forward = outputs[0];
                    this.controls.left = outputs[1];
                    this.controls.right = outputs[2];
                    this.controls.reverse = outputs[3];
                }
            }
        }
    }
    // detect collision with roadBorders and traffic
    #assessDamage(roadBorders, traffic) {
        for (let i = 0; i < roadBorders.length; i++) {
            if (polyIntersect(this.polygon, roadBorders[i])) {
                return true;
            }
        }
        for (let i = 0; i < traffic.length; i++) {
            if (polyIntersect(this.polygon, traffic[i].polygon)) {
                return true;
            }
        }
        return false;
    }


    // create polygon for collision detection
    #createPolygon() {
        const points = [];

        // hypot(x, y) = sqrt(x^2 + y^2)
        const rad = Math.hypot(this.width, this.height) / 2;

        /*  alpha(y, x):  get the angle of the vector (x, y) and the x-axis
         *
         *  _width_
         *  |  |a/|
         *  |  |/ | height
         *  |     |
         *  |_____|
         */
        const alpha = Math.atan2(this.width, this.height);
        // top-right point
        points.push({
            x: this.x - rad * Math.sin(this.angle - alpha),
            y: this.y - rad * Math.cos(this.angle - alpha)
        });
        // top-left point
        points.push({
            x: this.x - rad * Math.sin(this.angle + alpha),
            y: this.y - rad * Math.cos(this.angle + alpha)
        });
        // bottom-left point
        points.push({
            x: this.x - rad * Math.sin(Math.PI + this.angle - alpha),
            y: this.y - rad * Math.cos(Math.PI + this.angle - alpha)
        });
        // bottom-right point
        points.push({
            x: this.x - rad * Math.sin(Math.PI + this.angle + alpha),
            y: this.y - rad * Math.cos(Math.PI + this.angle + alpha)
        });

        return points;
    }

    #move() {
        if (this.controls.forward)
            this.speed += this.acceleration;

        if (this.controls.reverse)
            this.speed -= this.acceleration;

        // limit max speed
        if (this.speed > this.maxSpeed)
            this.speed = this.maxSpeed;

        // let car reverse not this fast
        if (this.speed < -this.maxSpeed / 2)
            this.speed = -this.maxSpeed / 2;

        if (this.speed > 0)
            this.speed -= this.friction;

        if (this.speed < 0)
            this.speed += this.friction;

        if (Math.abs(this.speed) < this.friction)
            this.speed = 0;


        if (this.speed != 0) {
            const flip = this.speed > 0 ? 1 : -1;
            if (this.controls.left) {
                this.angle += 0.03 * flip;
            }
            if (this.controls.right) {
                this.angle -= 0.03 * flip;
            }
        }
        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }

    draw(ctx, color, drawSensors = false) {

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.angle);
        ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();

        if (this.sensor && drawSensors) {
            this.sensor.draw(ctx);
        }
    }
}

