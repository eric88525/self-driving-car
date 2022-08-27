class Sensor {
    constructor(car) {
        this.car = car;
        this.rayCount = 5;
        this.rayLength = 150;
        this.raySpread = Math.PI / 4;
        this.rays = [];
        // telling if there's a border there or not
        // and how far is now
        this.readings = [];
    }

    update(roadBorders) {
        this.#castRays();
        this.readings = [];
        for (let i = 0; i < this.rays.length; i++) {
            this.readings.push(
                this.#getReading(
                    this.rays[i], roadBorders)
            );
        }
    }
    // Get the intersection of ray and roadBorder
    #getReading(ray, roadBorders) {
        let touches = [];

        for (let i = 0; i < roadBorders.length; i++) {
            const touch = getIntersection(
                ray[0],
                ray[1],
                roadBorders[i][0],
                roadBorders[i][1]);
            if (touch) {
                touches.push(touch);
            }
        }

        if (touches.length === 0) {
            return null;
        } else {
            // save all touches offset in offsets array
            const offsets = touches.map(e => e.offset);
            // ... is spread operator, get the minimum offset
            const minOffset = Math.min(...offsets);
            // go through all the touches and return the one with the minimum offset
            return touches.find(e => e.offset == minOffset);
        }
    }

    // Create ray from car position to end point
    #castRays() {
        this.rays = [];
        for (let i = 0; i < this.rayCount; i++) {
            const rayAngle = lerp(
                this.raySpread / 2,
                -this.raySpread / 2,
                this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1)
            ) + this.car.angle;
            
            const start = {
                x: this.car.x,
                y: this.car.y
            };
            // the top of the page is 0 degree,
            // left is pi/2 degree
            // right is -pi/2 degree
            const end = {
                x: this.car.x -
                    Math.sin(rayAngle) * this.rayLength,
                y: this.car.y -
                    Math.cos(rayAngle) * this.rayLength
            };
            this.rays.push([start, end]);
        }
    }
    draw(ctx) {
        for (let i = 0; i < this.rayCount; i++) {

            let end = this.rays[i][1];

            if (this.readings[i]) {
                end = this.readings[i];
            }

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.moveTo(
                this.rays[i][0].x,
                this.rays[i][0].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();
            
            // draw black line
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            ctx.moveTo(
                this.rays[i][1].x,
                this.rays[i][1].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();
        }
    }
}