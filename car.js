class Car {
    constructor(x, y, width, height, controlType, maxSpeed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damage = false;

        if (controlType != "DUMMY")
            this.sensor = new Sensor(this);

        this.controls = new Controls(controlType);
    }

    update(roadBorders, traffic) {
        if (!this.damage) {
            this.#move();
            this.polygon = this.#createPolygon();
            this.damage = this.#assessDamage(roadBorders, traffic);
        }
        if (this.sensor)
            this.sensor.update(roadBorders, traffic);

    }
    // detect collision with roadBorders and traffic
    #assessDamage(roadBorders, traffic) {
        for (let i = 0; i < roadBorders.length; i++) {
            if (polyIntersect(this.polygon, roadBorders[i])) {
                return true;
            }
        }
        for(let i=0;i<traffic.length;i++) {
            if(polyIntersect(this.polygon, traffic[i].polygon)) {
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

    draw(ctx, color) {

        if (this.damage)
            ctx.fillStyle = "gray";
        else
            ctx.fillStyle = color;

        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);

        for (let i = 1; i < this.polygon.length; i++)
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);

        ctx.fill()

        if (this.sensor)
            this.sensor.draw(ctx);

    }
}

