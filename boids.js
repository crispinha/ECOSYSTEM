const max = require('max-api');

// boid algo params, set from max
let params = {
	local: 0.3,
	avoid: 0.3,
	cohere: 0.3,
	align: 0.3
}

let time = Date.now();

// 2d vector math class
// most operations support both vec/vec and vec/scalar modes
class vec {
	constructor(x, y) {
		this.x = x; this.y = y;
	}

	add(o) {
		let n = new vec(0, 0);
		if (typeof o == "number") {
			n.x = this.x + o;
			n.y = this.y + o;
		} else if (o instanceof vec) {
			n.x = this.x + o.x;
			n.y = this.y + o.y;
		}
		return n;
	}

	eqadd(o) {
		this.x += o.x;
		this.y += o.y;
		return this;
	}

	mul(o) {
		let n = new vec(0, 0);
		if (typeof o == "number") {
			n.x = this.x * o;
			n.y = this.y * o;
		} else if (o instanceof vec) {
			n.x = this.x * o.x;
			n.y = this.y * o.y;
		}
		return n;
	}

	eqmul(o) {
		if (typeof o == "number") {
			this.x *= o;
			this.y *= o;
		} else if (o instanceof vec) {
			this.x *= o.x;
			this.y *= o.y;
		}
		return this;
	}

	sub(o) {
		let n = new vec(0, 0);
		n.x = this.x - o.x;
		n.y = this.y - o.y;
		return n;
	}

	eqdiv(o) {
		if (typeof o == "number") {
			if (o == 0) {
				this.x = 0; this.y = 0;
			}
			this.x /= o;
			this.y /= o;
		} else if (o instanceof vec) {
			if (o.nan()) {
				max.post("divisor nan");
			}
			this.x /= o.x;
			this.y /= o.y;
		}
		return this;
	}

	neg() {
		return new vec(-this.x, -this.y);
	}

	eqneg() {
		this.x *= -1;
		this.y *= -1;
		return this;
	}

	norm() {
		let n = new vec(this.x, this.y);
		n.eqdiv(this.length());
		return n;
	}

	eqnorm() {
		this.eqdiv(this.length());
		return this;
	}

	length() {
		return Math.sqrt((this.x*this.x) + (this.y*this.y));
	}

	nan() {
		return Number.isNaN(this.x) || Number.isNaN(this.y);
	}
}

class boid {
	constructor(x, y) {
		this.pos = new vec(x, y);
		this.vel = new vec(0.3, 0.1);
		this.acc = new vec(0, 0);

		this.timer = 0;
	}

	process() { // returns number of boids in neighborhood
		// run 1 step of boids algo

		// find boids in neighborhood
		let local = [];
		for (let b of boids) {
			if (b != this && this.pos.sub(b.pos).length() <= params.local) {
				local.push(b);
			}
		}

		if (local.length == 0) {
			return 0;
		}

		let cohesion = new vec(0, 0);
		let alignment = new vec(0, 0);
		let avoidance = new vec(0, 0);

		// do main force calculations
		for (let b of local) {
			cohesion.eqadd(b.pos);
			alignment.eqadd(b.vel);

			let displacement = this.pos.sub(b.pos);
			let distance = displacement.length();
			displacement.eqdiv(distance * distance);
			avoidance.eqadd(displacement);
		}

		cohesion.eqdiv(local.length);
		alignment.eqdiv(local.length);

		let cohese_force = cohesion.sub(this.pos);
		let align_force = alignment.sub(this.vel);

		// set acceleration from forces
		this.acc = (cohese_force.mul(params.cohere))
							 .eqadd(align_force.mul(params.align))
							 .eqadd(avoidance.mul(params.avoid));

		// and add confinement force so they stay inside bounds
		let confine_force = this.pos.neg();
		if (this.pos.length() >= 0.96) {
			confine_force.eqmul(30);
			this.acc.eqdiv(10);
		} else {
			confine_force.eqdiv(4);
		}
		this.acc.eqadd(confine_force);

		return local.length;
	}

// step is time in seconds (usually > 0 unless something's weird)
	update(step) {
		this.timer += step;

		if (this.vel.length() > 0.4) {
			this.vel.eqnorm();
			this.vel.eqmul(0.4);
		}

		// apply acceleration to velocity, velocity to position
		// ie physics process
		this.vel.eqadd(this.acc.mul(step));
		this.pos.eqadd(this.vel.mul(step));

		// keep inside bounds
		// bounds is circle centred at (0,0)
		if (this.pos.length() > 0.96) {
			this.pos.eqnorm();
			this.pos.eqmul(0.95);

			if (this.timer > 0.5) {
				this.timer = 0;
			}
			this.vel.eqmul(0);
		}

		// if we're somehow outside of bounds wrap around edges
		// doesn't happen in practice but keeps simulation/visuals working if it did
		if (this.pos.x >= 1) {
			this.pos.x = -1;
		} else if (this.pos.x <= -1) {
			this.pos.x = 1
		}
		if (this.pos.y >= 1) {
			this.pos.y = -1;
		} else if (this.pos.y <= -1) {
			this.pos.y = 1
		}
	}

	// for sending to gfx
	serialise() {
		return `${this.pos.x}/${this.pos.y}`;
	}
}

// setup boids

function newBoid() {
	let x = (Math.random() * 0.5) - 0.25;
	let y = (Math.random()* 0.5) - 0.25;
	//let time = (Math.random() * 7) + 3;

	let b = new boid(x, y);

	let angle = Math.random() * Math.PI * 2;
	b.vel = new vec(Math.cos(angle), Math.sin(angle)).mul(0.25).eqneg();

	return b;
}

let boids = [];

for (let i = 0; i < 20; i++) {
	boids.push(newBoid());
}


max.addHandler("tick", () => {
	// work out time since last frame
	let now = Date.now();
	let step = (now - time) / 1000;
	time = now;

	// calculate properties of simulation and send them to max
	let connectedness = 0;
	for (const b of boids) {
		// and step boids algo
		connectedness += b.process(step);
	}
	connectedness /= boids.length;
	connectedness /= boids.length;
	max.outlet(["connectedness", connectedness]);

	let speediness = 0;
	let avg_x = 0;
	for (const b of boids) {
		b.update(step);
		speediness += b.vel.length();
		avg_x += b.pos.x;
	}	

	speediness /= boids.length;
	avg_x /= boids.length;
	max.outlet(["speediness", speediness]);
	max.outlet(["avg-x", avg_x]);

	// and send positions to gfx
	let out = ["boid"];
	for (const b of boids) {
		out.push(b.serialise());
	}	
	max.outlet(out);

});

// update simulation parameters from max/msp

max.addHandler("local", (n) => {
	params.local = n;
});

max.addHandler("avoid", (n) => {
	params.avoid = n;
});

max.addHandler("cohere", (n) => {
	params.cohere = n;
});

max.addHandler("align", (n) => {
	params.align = n;
});

max.addHandler("resume", () => {
	time = Date.now();
});