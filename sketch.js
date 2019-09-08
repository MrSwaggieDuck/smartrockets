let population = new Population;
let popsize = 50;
let lifespan = 500;
let finish;
let mutationRate = 0.01;
let obstacles = [new Obstacle(400, 200, 20, 400), new Obstacle(800, 650, 20, 300), new Obstacle(1200, 200, 20, 400)];


function setup() {
  createCanvas(1600,800);

  for (i = 0; i < popsize; i++) {
    population.rockets[i] = new Rocket();
    population.rockets[i].makeDNA();
  }

  rectMode(CENTER);
  ellipseMode(CENTER);
  noStroke();

  finish = new p5.Vector(width, height/2);
}

function draw() {
  background(0);

  allDead = true;

  for (i = 0; i < population.rockets.length; i++) {
    population.rockets[i].move();
    population.rockets[i].draw();

    if (!population.rockets[i].dead && !population.rockets[i].finished) allDead = false;
  }

  if (allDead) {
    population.newGen();
  }

  for (i = 0; i < obstacles.length; i++) {
    obstacles[i].draw();
  }

  fill(255,0,0);
  ellipse(finish.x, finish.y, 50);

}

function Population() {
  this.rockets = [];
  this.matingpool = [];

  this.newGen = function() {
    this.matingpool = [];
    for (k = 0; k < this.rockets.length; k++) {
      fit = this.rockets[k].getFitness();
      for (l = 0; l < fit; l++) {
        this.matingpool.push(this.rockets[k]);
      }
    }

    for (k = 0; k < popsize; k++) {
      this.rockets[k] = new Rocket(random(this.matingpool));
    }


  }
}

function Rocket(parent) {
  this.pos = new p5.Vector(10, height/2);
  this.acc = new p5.Vector();
  this.vel = new p5.Vector();

  this.count = 0;
  this.fitness;
  this.DNA = [lifespan];
  this.parent = parent;
  this.finished = false;
  this.dead = false;

  if (this.parent != null) {
    for (l = 0; l < lifespan; l++) {
      if (this.parent.finished) {
        if (random(0, 1) < mutationRate/10) {
          this.DNA[l] = p5.Vector.random2D();
        } else {
          this.DNA[l] = this.parent.DNA[l];
        }
      } else {
        if (random(0, 1) < mutationRate) {
          this.DNA[l] = p5.Vector.random2D();
        } else {
          this.DNA[l] = this.parent.DNA[l];
        }
      }
      
    }
  }

  this.makeDNA = function() {
    for (j = 0; j < lifespan; j++) {
      this.DNA[j] = p5.Vector.random2D();
    }
  }

  this.draw = function() {
    fill(255);
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    rect(0, 0, 50, 10);
    pop();
  }

  this.move = function() {
    if (this.dead || this.finished) return;
    this.acc.add(this.DNA[this.count]);
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.vel.limit(10);

    if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height || this.count > lifespan) {
      this.dead = true;
    }

    if (dist(this.pos.x, this.pos.y, finish.x, finish.y) < 50) {
      this.finished = true;
    }

    this.colliding();

    this.count++;
  }

  this.getFitness = function() {
    d = dist(this.pos.x, this.pos.y, finish.x, finish.y);
    this.fitness = map(d, 0, width, width, 0);
    if (this.finished) this.fitness *= 100 * 100/this.count;
    if (this.dead) this.fitness /= 2;
    return this.fitness;
  }

  this.colliding = function() {
    for (object = 0; object < obstacles.length; object++) {
      currentObstacle = obstacles[object];
      if (this.pos.x > currentObstacle.pos.x - currentObstacle.size.x/2 && this.pos.x < currentObstacle.pos.x + currentObstacle.size.x/2 &&
          this.pos.y > currentObstacle.pos.y - currentObstacle.size.y/2 && this.pos.y < currentObstacle.pos.y + currentObstacle.size.y/2) {
            this.dead = true;
      }

    }
  }
}

function Obstacle(x, y, width, height, angle) {
  this.pos = new p5.Vector(x, y);
  this.size = new p5.Vector(width, height);
  this.angle = angle;

  this.draw = function() {
    fill(255,0,0);
    rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
  }
}