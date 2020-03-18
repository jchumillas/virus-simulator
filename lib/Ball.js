// function getRandomArbitrary(min, max) {
//   return Math.random() * (max - min) + min;
// }

function getRandomInt(min, max) {
  // min = Math.ceil(min);
  // max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateAge(agesDistribution) {
  const totalAgesValue = agesDistribution.reduce((a, b) => a + b, 0);
  let ageIndexGenerated = getRandomInt(0, totalAgesValue - 1);
  for (let i = 0; i < agesDistribution.length; i += 1) {
    if (agesDistribution[i] <= ageIndexGenerated) {
      ageIndexGenerated -= agesDistribution[i];
    } else {
      return i * 10 + ageIndexGenerated;
    }
  }
}

function calculateIfWillDie(age, severity, fatalityAgesDistribution, inHospital) {
  let prob = fatalityAgesDistribution[Math.trunc(age / 10)];
  if (inHospital) prob = prob / 2 + severity * 0.5;
  else prob = prob + severity * 1.5;
  if (getRandomInt(0, 100) > prob) {
    return false;
  }
  return true;
}

function generateXPosition(mapMargin, ctx) {
  if (Math.random() > 0.5) {
    return getRandomInt(mapMargin, ctx.canvas.width / 2 - 50);
  } else {
    return getRandomInt(ctx.canvas.width / 2 + 50, ctx.canvas.width - mapMargin * 2);
  }
}

function generateYPosition(mapMargin, ctx) {
  if (Math.random() > 0.5) {
    return getRandomInt(mapMargin, ctx.canvas.height / 2 - 50);
  } else {
    return getRandomInt(ctx.canvas.height / 2 + 50, ctx.canvas.height - mapMargin * 2);
  }
}

function Ball(
  ctx,
  balls,
  maxVel,
  agesDistribution,
  incubationTime,
  symptomaticTime,
  severity,
  fatalityAgesDistribution,
  obedienceRate
) {
  this.balls = balls;
  this.infected = false;
  this.incubating = false;
  this.symptomatic = false;
  this.immunized = false;
  this.x = generateXPosition(20, ctx);
  this.y = generateYPosition(20, ctx);
  this.velX = getRandomInt(-maxVel, maxVel);
  this.velY = getRandomInt(-maxVel, maxVel);
  this.size = 3;
  this.maxVel = maxVel;
  this.changeDir = getRandomInt(40, 70);
  this.age = generateAge(agesDistribution);
  this.incubationDays = getRandomInt(incubationTime[0], incubationTime[1]);
  this.symptomaticDays = getRandomInt(symptomaticTime[0], symptomaticTime[1]);
  this.daysToHospitalize = 2;
  this.lastDayUpdate = 0;
  this.severity = severity;
  this.fatalityAgesDistribution = fatalityAgesDistribution;
  this.obey = getRandomInt(0, 100) <= obedienceRate;
  this.confinated = false;
  this.died = false;
  this.diedInHospital = false;
  this.goingToHospital = false;
  this.inHospital = false;
}

Ball.prototype.draw = function(ctx) {
  ctx.beginPath();
  if (this.died) {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    ctx.moveTo(this.x - this.size, this.y - this.size);
    ctx.lineTo(this.x + this.size, this.y + this.size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.x + this.size, this.y - this.size);
    ctx.lineTo(this.x - this.size, this.y + this.size);
    ctx.stroke();
  } else {
    if (this.infected) {
      ctx.fillStyle = 'yellow';
      if (this.incubating) ctx.fillStyle = 'orange';
      if (this.symptomatic) ctx.fillStyle = 'red';
    } else if (this.immunized) {
      ctx.fillStyle = 'blue';
    } else {
      ctx.fillStyle = 'white';
    }
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
    if (this.confinated && !this.goingToHospital) {
      ctx.beginPath();
      ctx.strokeStyle = 'green';
      ctx.lineWidth = 2;
      ctx.moveTo(this.x - this.size * 2, this.y - this.size * 2);
      ctx.lineTo(this.x - this.size * 2, this.y + this.size * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(this.x - this.size * 2, this.y + this.size * 2);
      ctx.lineTo(this.x + this.size * 2, this.y + this.size * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(this.x + this.size * 2, this.y + this.size * 2);
      ctx.lineTo(this.x + this.size * 2, this.y - this.size * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(this.x + this.size * 2, this.y - this.size * 2);
      ctx.lineTo(this.x - this.size * 2, this.y - this.size * 2);
      ctx.stroke();
      ctx.beginPath();
    }
  }
};

Ball.prototype.update = function(ctx, days, increaseHealthBusy, decreaseHealthBusy, isHealthFullFunc) {
  if (this.goingToHospital) {
    if (ctx.canvas.width / 2 > this.x) this.velX = 1;
    if (ctx.canvas.width / 2 < this.x) this.velX = -1;
    if (ctx.canvas.height / 2 > this.y) this.velY = 1;
    if (ctx.canvas.height / 2 < this.y) this.velY = -1;
    this.x += this.velX;
    this.y += this.velY;
  }
  if (!this.confinated && !this.inHospital) {
    if (!this.goingToHospital && !this.inHospital) {
      if (this.changeDir === 0) {
        this.velX = getRandomInt(-this.maxVel, this.maxVel);
        this.velY = getRandomInt(-this.maxVel, this.maxVel);
        this.changeDir = getRandomInt(40, 70);
      }

      // Detect borders collisions
      if (this.x + this.size >= ctx.canvas.width - 40) {
        this.velX = -this.velX;
        this.x -= 2;
      }

      if (this.x - this.size <= 20) {
        this.velX = -this.velX;
        this.x += 2;
      }

      if (this.y + this.size >= ctx.canvas.height - 40) {
        this.velY = -this.velY;
        this.y -= 2;
      }

      if (this.y - this.size <= 20) {
        this.velY = -this.velY;
        this.y += 2;
      }
    }

    // Detect hospital collision
    if (
      this.x + this.size >= ctx.canvas.width / 2 - 45 &&
      this.y + this.size >= ctx.canvas.height / 2 - 45 &&
      this.x <= ctx.canvas.width / 2 + 45 &&
      this.y <= ctx.canvas.height / 2 + 45
    ) {
      if (!this.goingToHospital) {
        this.x = this.x - this.velX * 4;
        this.y = this.y - this.velY * 4;
        this.velX = -this.velX * 2;
        this.velY = -this.velY * 2;
      } else {
        this.goingToHospital = false;
        this.inHospital = true;
        this.x = ctx.canvas.width / 2;
        this.y = ctx.canvas.height / 2;
      }
    }
    this.x += this.velX;
    this.y += this.velY;
    this.changeDir = this.changeDir - 1;
  }

  if (days > this.lastDayUpdate) {
    this.lastDayUpdate = days;
    if (this.infected) {
      if (this.incubationDays > 0) {
        this.incubationDays--;
        this.incubating = true;
      } else if (this.symptomaticDays > 0) {
        this.daysToHospitalize--;
        this.symptomaticDays--;
        this.incubating = false;
        this.symptomatic = true;
      } else if (this.symptomaticDays <= 0) {
        this.symptomatic = false;
        this.infected = false;
        const died = calculateIfWillDie(this.age, this.severity, this.fatalityAgesDistribution, this.inHospital);
        if (this.inHospital || this.goingToHospital) decreaseHealthBusy();
        this.immunized = !died;
        this.died = died;
        if (this.died) {
          this.diedInHospital = this.inHospital;
        }
        if (this.immunized && this.inHospital) {
          this.x = ctx.canvas.width / 2 - 48;
          this.y = ctx.canvas.height / 2 - 48;
          this.velX = -1;
          this.velY = -1;
          this.changeDir = 5;
        }
        this.inHospital = false;
        this.goingToHospital = false;
      }
      if (this.daysToHospitalize === 0 && this.symptomatic && !isHealthFullFunc()) {
        this.goingToHospital = true;
        increaseHealthBusy();
      }
    }
  }
};

Ball.prototype.collisionDetect = function(propagation) {
  for (let j = 0; j < this.balls.length; j++) {
    if (
      this.infected &&
      !this.balls[j].infected &&
      !this.balls[j].immunized &&
      !this.balls[j].confinated &&
      !this.balls[j].died &&
      getRandomInt(0, 100) <= propagation * 2 &&
      !(
        this.x === this.balls[j].x &&
        this.y === this.balls[j].y &&
        this.velX === this.balls[j].velX &&
        this.velY === this.balls[j].velY
      )
    ) {
      const dx = this.x - this.balls[j].x;
      const dy = this.y - this.balls[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.size + this.balls[j].size) {
        this.balls[j].infected = true;
      }
    }
  }
};

export default Ball;
