var population;
var lifespan = 200;
var lifeP;
var count = 0;
var target;
var maxForce = 0.2;
var bestDNA;
var bestRocket;
var bestTime = Infinity;

var rx = 150;
var ry = 200;
var rw = 200;
var rh = 10;

function setup() {
	createCanvas(500, 400);
	population = new Population();
	lifeP = createP();
	target  = createVector(width/2, 50);
	bestDNA = new DNA();
	bestRocket = new Rocket(bestDNA);
}

function draw() {
	background(50);
	population.run();
	
	bestRocket.update();
	bestRocket.showHighlighted();

	lifeP.html("Best Time: " + bestTime);
	count++;

	if(count == lifespan){
		count = 0;
		//population = new Population();
		population.evaluate();
		population.selection();
		bestRocket = new Rocket(bestDNA);
	}

	fill(255);
	rect(rx,ry,rw,rh);

	ellipse(target.x, target.y, 16)
}


function Population(){
	this.rockets = [];
	this.popsize = 200;
	this.matingpool = [];

	for(var i = 0; i < this.popsize; i++){
		this.rockets[i] = new Rocket();
	}

	this.run = function(){
		for(var i = 0; i < this.popsize; i++){
			this.rockets[i].update();
			this.rockets[i].show();
		}
	}

	this.evaluate = function(){
		var maxfit = 0;
		for(var i = 0; i < this.popsize; i++){
			this.rockets[i].calcFitness();
			if(this.rockets[i].fitness > maxfit){
				maxfit = this.rockets[i].fitness;
				bestDNA = this.rockets[i].dna;
			}
		}
		createP(maxfit);

		for(var i = 0; i < this.popsize; i++){
			this.rockets[i].fitness /= maxfit;
		}

		this.matingpool = [];
		for(var i = 0; i < this.popsize; i++){
			var n = this.rockets[i].fitness * 100;
			for(var j = 0; j < n; j++)
				this.matingpool.push(this.rockets[i]);
		}

	}

	this.selection = function(){
		var newRockets = [];

		for(var i = 0; i < this.rockets.length; i++){
			var parentA = random(this.matingpool).dna;
			var parentB = random(this.matingpool).dna;
			var child = parentA.crossover(parentB);
			child.mutation();
			newRockets[i] = new Rocket(child)
		}
		this.rockets = newRockets;
	}
}



function DNA(genes){
	if(genes){
		this.genes = genes;
	}else{
		this.genes = []
		for(var i = 0; i < lifespan; i++){
			this.genes[i] = p5.Vector.random2D();
			this.genes[i].setMag(maxForce);
		}
	}
	

	this.crossover = function(partner){
		var newgenes = [];
		var mid = floor(random(this.genes.length));
		for(var i = 0; i < this.genes.length; i++){
			if(i > mid)
				newgenes[i] = this.genes[i];
			else
				newgenes[i] = partner.genes[i];
		}

		return new DNA(newgenes);
	}

	this.mutation = function(){
		for(var i = 0; i < this.genes.length; i++){
			if(random(1) < 0.025){
				this.genes[i] = p5.Vector.random2D();
				this.genes[i].setMag(maxForce);
			}
		}
	}
}




function Rocket(dna) {
	this.pos = createVector(width/2, height);
	this.vel = createVector();
	this.acc = createVector();
	this.fitness = 0;
	this.completed = false;
	this.crashed = false;
	this.time = 0;
	if(dna)
		this.dna = dna;
	else
		this.dna = new DNA();

	this.applyForce = function(force){
		this.acc.add(force);
	}

	this.update = function(){
		var d = dist(this.pos.x, this.pos.y, target.x, target.y)
		if(d < 10){
			this.completed = true;
			this.pos = target.copy();
			if(this.time == 0)
				this.time = count;
		}

		if(this.pos.x > rx && this.pos.x < rx + rw && this.pos.y > ry && this.pos.y < ry + rh){
			this.crashed = true;
			if(this.time == 0)
				this.time = count;
		}

		if(this.pos.x > width || this.pos.x < 0){
			this.crashed = true;
			if(this.time == 0)
				this.time = count;
		}

		if(this.pos.y > height || this.pos.y < 0){
			this.crashed = true;
			if(this.time == 0)
				this.time = count;
		}

		this.applyForce(this.dna.genes[count]);

		if(!this.completed && !this.crashed){
			this.vel.add(this.acc);
			this.pos.add(this.vel);
			this.acc.mult(0);	
		}
	}

	this.show = function(){
		push();
		noStroke();
		fill(255, 140);
		translate(this.pos.x, this.pos.y);
		rotate(this.vel.heading());
		rectMode(CENTER)
		rect(0,0,20,3);
		pop();
	}

	this.showHighlighted = function(){
		push();
		noStroke();
		fill(255,0,255,255);
		translate(this.pos.x, this.pos.y);
		rotate(this.vel.heading());
		rectMode(CENTER)
		rect(0,0,25,5);
		pop();
	}

	this.calcFitness = function(){
		var d = dist(this.pos.x, this.pos.y, target.x, target.y);
		this.fitness = map(d, 0, width, width, 0);

		if(this.completed){
			if(this.time < bestTime){
				bestTime = this.time;
			}

			var multiplier = map(this.time, 0, lifespan, 25, 10);
			console.log(multiplier);
			this.fitness *= multiplier;
		}
			
		if(this.crashed){
			this.fitness /= d;
		}
	}
}