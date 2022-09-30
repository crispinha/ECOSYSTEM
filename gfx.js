inlets = 1;
outlets = 0;

sketch.default2d();

var boids = [];

// receive boids positions as max message
function anything() {
	var in_boids = arrayfromargs("", arguments);

	// format "x/y"
	boids = [];
	for (var i = 1; i < in_boids.length; i++) {
		var parts = in_boids[i].split("/");
		var b = {};
		b.x = parseFloat(parts[0]);
		b.y = parseFloat(parts[1]);
		boids.push(b);
	}
	draw();
}

function draw() {
	//draw background colour
	sketch.glclearcolor(0.058, 0.850, 0.545);
	sketch.glclear();

	//draw big "pond" circle
	sketch.glcolor(0.058, 0.211, 0.850);
	sketch.moveto(0, 0, 0);
	sketch.circle(0.95);

	//draw each boid as circle
	sketch.glcolor(0.850, 0.403, 0.015);
	for (var i = 0; i < boids.length; i++) {
		var b = boids[i];

		sketch.moveto(b.x, b.y, 0);
		sketch.circle(0.02);
	}
	refresh();
}