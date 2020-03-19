<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <h1>Virus simulator</h1>
        <h3>Days: {{ days }}</h3>
        <!-- Canvas -->
        <div class="div-canvas">
          <canvas id="c"></canvas>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn @click="stop = !stop">
          <span v-if="!stop">Pause <v-icon right dark>mdi-pause</v-icon></span>
          <span v-if="stop">Play <v-icon right dark>mdi-play</v-icon></span>
        </v-btn>
        <v-btn @click="updateBalls()">Restart<v-icon right dark>mdi-cached</v-icon></v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card light>
          <v-tabs v-model="active_tab" centered icons-and-text>
            <v-tabs-slider></v-tabs-slider>
            <v-tab href="#tab-legend">
              Legend
              <v-icon>mdi-information</v-icon>
            </v-tab>
            <v-tab href="#tab-scenario">
              Scenario config
              <v-icon>mdi-earth</v-icon>
            </v-tab>
            <v-tab href="#tab-virus">
              Virus config
              <v-icon>mdi-pac-man</v-icon>
            </v-tab>
            <v-tab href="#tab-actions">
              Actions
              <v-icon>mdi-flash</v-icon>
            </v-tab>
            <v-tab href="#tab-stats">
              Stats
              <v-icon>mdi-chart-bar</v-icon>
            </v-tab>
          </v-tabs>
          <v-tabs-items v-model="active_tab" light>
            <v-tab-item :value="'tab-legend'">
              <v-card flat light>
                <v-card-text>
                  <v-row>
                    <v-col md="3" sm="4" align-self="center">
                      <v-icon color="black">mdi-checkbox-blank-circle-outline</v-icon>
                      <v-label light>Healthy</v-label>
                    </v-col>
                    <v-col md="3" sm="4" align-self="center">
                      <v-icon color="orange">mdi-checkbox-blank-circle</v-icon>
                      <v-label light>Infected & incubation period</v-label>
                    </v-col>
                    <v-col md="3" sm="4" align-self="center">
                      <v-icon color="red">mdi-checkbox-blank-circle</v-icon>
                      <v-label light>Infected & symptomatic</v-label>
                    </v-col>
                    <v-col md="3" sm="4" align-self="center">
                      <v-icon color="blue">mdi-checkbox-blank-circle</v-icon>
                      <v-label light>Healthy & immunized</v-label>
                    </v-col>
                    <v-col md="3" sm="4" align-self="center">
                      <v-icon color="red">mdi-close-thick</v-icon>
                      <v-label light>Dead</v-label>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-tab-item>
            <v-tab-item :value="'tab-scenario'">
              <v-card flat>
                <v-card-text>
                  <v-slider
                    v-model="ballsNum"
                    label="Population"
                    step="100"
                    min="100"
                    max="1000"
                    ticks="always"
                    thumb-label="always"
                    tick-size="4"
                    @change="updateBalls()"
                  ></v-slider>
                  <v-slider
                    v-model="obedienceRate"
                    label="Obedience Rate"
                    step="5"
                    min="0"
                    max="100"
                    ticks="always"
                    thumb-label="always"
                    tick-size="4"
                    @change="updateBalls()"
                  ></v-slider>
                  <v-slider
                    v-model="healthCapacityPercent"
                    label="Health Capacity"
                    thumb-label="always"
                    tick-size="4"
                    :thumb-size="24"
                    :min="0"
                    :max="7"
                    @change="updateBalls()"
                  >
                    <template v-slot:thumb-label="{ value }">
                      {{ healthCapacityEmojis[value] }}
                    </template>
                  </v-slider>
                  <v-label light>Population distribution by ages</v-label>
                  <div id="agesSparkline">
                    <Sparkline
                      :ages-distribution="agesDistribution"
                      :ages-distribution-label="agesDistributionLabel"
                      :chart-type="agesDistString"
                    />
                  </div>
                  <v-row>
                    <v-col v-for="(i, index) in agesDistribution" :key="index" md="3" sm="4" align-self="center">
                      <v-btn-toggle rounded>
                        <v-btn small @click="decreaseAgeDist(index)">
                          <v-icon>mdi-minus</v-icon>
                        </v-btn>
                        <v-btn small disabled>{{ agesDistributionLabel[index] }}</v-btn>
                        <v-btn small @click="increaseAgeDist(index)">
                          <v-icon>mdi-plus</v-icon>
                        </v-btn>
                      </v-btn-toggle>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-tab-item>
            <v-tab-item :value="'tab-virus'">
              <v-card flat>
                <v-card-text>
                  <v-slider
                    v-model="propagation"
                    label="Propagation"
                    :tick-labels="propagationLabels"
                    :max="4"
                    tick-size="4"
                  ></v-slider>
                  <v-range-slider
                    v-model="incubationTime"
                    label="Incubation time (days)"
                    class="align-center"
                    :max="30"
                    :min="1"
                    thumb-label="always"
                    ticks="always"
                    @change="updateBalls()"
                  >
                  </v-range-slider>
                  <v-range-slider
                    v-model="symptomaticTime"
                    label="Symptomatic time (days)"
                    class="align-center"
                    :max="25"
                    :min="3"
                    thumb-label="always"
                    ticks="always"
                    @change="updateBalls()"
                  >
                  </v-range-slider>
                  <v-slider
                    v-model="severity"
                    label="Severity"
                    :tick-labels="severityLabels"
                    :max="4"
                    tick-size="4"
                    @change="updateBalls()"
                  ></v-slider>
                  <v-label light>Fatality distribution by ages</v-label>
                  <div id="fatalityParkline">
                    <Sparkline
                      :ages-distribution="fatalityAgesDistribution"
                      :ages-distribution-label="agesDistributionLabel"
                      :chart-type="fatalityDistString"
                    />
                  </div>
                  <v-row>
                    <v-col
                      v-for="(i, index) in fatalityAgesDistribution"
                      :key="index"
                      md="3"
                      sm="4"
                      align-self="center"
                    >
                      <v-btn-toggle rounded>
                        <v-btn small @click="decreaseFatalityAgeDist(index)">
                          <v-icon>mdi-minus</v-icon>
                        </v-btn>
                        <v-btn small disabled>{{ agesDistributionLabel[index] }}</v-btn>
                        <v-btn small @click="increaseFatalityAgeDist(index)">
                          <v-icon>mdi-plus</v-icon>
                        </v-btn>
                      </v-btn-toggle>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-tab-item>
            <v-tab-item :value="'tab-actions'">
              <v-card flat>
                <v-card-text>
                  <v-row>
                    <v-col>
                      <v-label light>Confinement</v-label>
                      <v-radio-group v-model="confinement" row @change="applyConfinement()">
                        <v-radio label="No" color="primary" value="no"></v-radio>
                        <v-radio label="Partial" color="secondary" value="partial"></v-radio>
                        <v-radio label="Full" color="error" value="full"></v-radio>
                      </v-radio-group>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-tab-item>
            <v-tab-item :value="'tab-stats'">
              <v-card flat light>
                <v-card-text>
                  <v-row>
                    <zingchart ref="chart" :data="chartDataEveryDay"></zingchart>
                  </v-row>
                  <v-row>
                    <zingchart ref="chart" :data="chartDataAccumulated"></zingchart>
                  </v-row>
                  <v-row>
                    <zingchart ref="chart" :data="chartDataDead"></zingchart>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Vue from 'vue';
import Sparkline from '@/components/Sparkline';
import Ball from '@/lib/Ball';
let balls = [];
let vueCanvas = null;
const currentFps = [30, 60];
const fpsMult = [2, 1];
let fpsInterval, now, then, elapsed;

export default {
  components: { Sparkline },
  data() {
    return {
      stop: true,
      fpsRatio: 0,
      days: 0,
      currentFrame: 0,
      active_tab: 'tab-legend',
      mapWidth: 1100,
      mapHeight: 600,
      ballsNum: 600,
      obedienceRate: 90,
      agesDistribution: [2, 3, 4, 6, 7, 6, 3, 3, 2],
      agesDistString: 'ageDist',
      agesDistributionLabel: ['0+', '10+', '20+', '30+', '40+', '50+', '60+', '70+', '80+'],
      propagation: 3,
      propagationLabels: ['Very Slow', 'Slow', 'Normal', 'Fast', 'Very fast'],
      severity: 2,
      severityLabels: ['Low', 'Some', 'Normal', 'Worrying', 'Critical'],
      fatalityAgesDistribution: [1, 3, 3, 4, 5, 7, 9, 10, 15],
      fatalityDistString: 'fatalityDist',
      incubationTime: [4, 18],
      symptomaticTime: [4, 9],
      confinement: 'no',
      healthCapacityPercent: 4,
      healthCapacity: 0,
      healthBusy: 0,
      healthCapacityEmojis: ['💩', '👎', '🤨', '😐', '🙂', '👍', '👌', '👏'],
      infectedAcumulatedRegister: [],
      infectedRegister: [],
      incubatingRegister: [],
      symptomaticRegister: [],
      deadAcumulatedRegister: [],
      deadToday: [],
      deadInHospital: [],
      deadAtHome: []
    };
  },
  computed: {
    chartDataEveryDay() {
      return {
        title: { text: 'Infected (active cases) & Dead (every day)' },
        type: 'mixed',
        legend: {},
        'scale-x': {
          label: {
            text: 'Days'
          }
        },
        'scale-y': {
          label: {
            text: 'Cases'
          },
          guide: {
            'line-style': 'dotted'
          }
        },
        series: [
          {
            values: this.infectedRegister,
            backgroundColor: 'blue',
            text: 'Total Infected',
            type: 'line',
            aspect: 'spline'
          },
          {
            values: this.incubatingRegister,
            backgroundColor: 'orange',
            text: 'Total Incubating',
            type: 'line',
            aspect: 'spline'
          },
          {
            values: this.symptomaticRegister,
            backgroundColor: 'red',
            text: 'Total Symptomatic',
            type: 'line',
            aspect: 'spline'
          },
          {
            values: this.deadToday,
            backgroundColor: 'black',
            text: 'Dead (every day)',
            type: 'bar'
          }
        ]
      };
    },
    chartDataAccumulated() {
      return {
        title: { text: 'Infected & Dead (total accumulated)' },
        type: 'area',
        legend: {},
        'scale-x': {
          label: {
            text: 'Days'
          }
        },
        'scale-y': {
          label: {
            text: 'Cases'
          },
          guide: {
            'line-style': 'dotted'
          }
        },
        series: [
          {
            values: this.infectedAcumulatedRegister,
            backgroundColor: 'blue',
            text: 'Infected',
            aspect: 'spline'
          },
          {
            values: this.deadAcumulatedRegister,
            backgroundColor: 'red',
            text: 'Dead',
            aspect: 'spline'
          }
        ]
      };
    },
    chartDataDead() {
      return {
        title: { text: 'Dead' },
        legend: {},
        type: 'pie',
        series: [
          {
            values: this.deadInHospital,
            text: 'Inside Healthcare',
            palette: 0
          },
          {
            values: this.deadAtHome,
            text: 'Outside Healthcare',
            palette: 1
          }
        ]
      };
    }
  },
  watch: {
    days() {
      let infected = 0;
      let dead = 0;
      let deadInHospital = 0;
      let incubating = 0;
      let infectedAcumulated = 0;
      let symptomatic = 0;
      for (let i = 0; i < balls.length; i++) {
        if (balls[i].infected) infected++;
        if (balls[i].died) dead++;
        if (balls[i].diedInHospital) deadInHospital++;
        if (balls[i].incubating) incubating++;
        if (balls[i].symptomatic) symptomatic++;
        if (balls[i].infected || balls[i].immunized || balls[i].died) infectedAcumulated++;
      }
      if (infected > 0) {
        if (this.deadAcumulatedRegister.length > 0) {
          const deadToday = dead - this.deadAcumulatedRegister[this.deadAcumulatedRegister.length - 1];
          this.deadToday.push(deadToday);
        } else {
          this.deadToday.push(0);
        }
        this.deadInHospital.pop();
        this.deadInHospital.push(deadInHospital);
        this.deadAtHome.pop();
        this.deadAtHome.push(dead - deadInHospital);
        this.infectedRegister.push(infected);
        this.deadAcumulatedRegister.push(dead);
        this.incubatingRegister.push(incubating);
        this.symptomaticRegister.push(symptomatic);
        this.infectedAcumulatedRegister.push(infectedAcumulated);
      }
    }
  },
  mounted() {
    const c = document.getElementById('c');
    const ctx = c.getContext('2d');
    ctx.canvas.width = this.mapWidth;
    ctx.canvas.height = this.mapHeight;
    vueCanvas = ctx;

    vueCanvas.beginPath();
    vueCanvas.fillStyle = 'rgba(0, 0, 0, 0.25)';
    vueCanvas.fillRect(20, 20, vueCanvas.canvas.width - 40, vueCanvas.canvas.height - 40);
    vueCanvas.stroke();
    this.generateBalls();
  },
  methods: {
    generateBalls() {
      while (balls.length < this.ballsNum) {
        const ball = new Ball(
          vueCanvas,
          balls,
          fpsMult[this.fpsRatio],
          this.agesDistribution,
          this.incubationTime,
          this.symptomaticTime,
          this.severity,
          this.fatalityAgesDistribution,
          this.obedienceRate
        );
        balls.push(ball);
      }
      balls[0].infected = true;
      this.currentFrame = 0;
      this.confinement = 'no';
      this.healthCapacity = (this.healthCapacityPercent * this.ballsNum) / 100;
      this.healthBusy = 0;
      this.infectedAcumulatedRegister = [];
      this.infectedRegister = [];
      this.incubatingRegister = [];
      this.symptomaticRegister = [];
      this.deadAcumulatedRegister = [];
      this.deadToday = [];
      this.startAnimating(currentFps[this.fpsRatio]);
    },
    startAnimating(fps) {
      fpsInterval = 1000 / fps;
      then = Date.now();
      this.loop();
    },
    loop() {
      requestAnimationFrame(this.loop);
      now = Date.now();
      elapsed = now - then;
      if (elapsed > fpsInterval) {
        if (!this.stop) {
          this.currentFrame++;
          this.days = Math.round(this.currentFrame / (currentFps[this.fpsRatio] / (2 / 4)));
        }
        then = now - (elapsed % fpsInterval);

        vueCanvas.fillStyle = '#121212';
        vueCanvas.fillRect(0, 0, vueCanvas.canvas.width, vueCanvas.canvas.height);
        vueCanvas.fillStyle = '#121212';
        vueCanvas.fillRect(20, 20, vueCanvas.canvas.width - 40, vueCanvas.canvas.height - 40);

        for (let i = 0; i < balls.length; i++) {
          balls[i].draw(vueCanvas);
          if (!balls[i].died && !this.stop) {
            balls[i].update(vueCanvas, this.days, this.increaseHealthBusy, this.decreaseHealthBusy, this.isHealthFull);
            balls[i].collisionDetect(this.propagation, fpsMult[this.fpsRatio]);
          }
        }

        vueCanvas.fillStyle = '#f7f7f7';
        vueCanvas.fillRect(vueCanvas.canvas.width / 2 - 40, vueCanvas.canvas.height / 2 - 40, 80, 80);
        vueCanvas.beginPath();
        vueCanvas.strokeStyle = 'red';
        vueCanvas.fillStyle = 'red';
        vueCanvas.font = 'bold 58px arial';
        vueCanvas.fillText('+', vueCanvas.canvas.width / 2, vueCanvas.canvas.height / 2);
        vueCanvas.strokeText('+', vueCanvas.canvas.width / 2, vueCanvas.canvas.height / 2);
        vueCanvas.font = 'bold 25px arial';
        const text = Math.round((this.healthBusy / this.healthCapacity) * 100) + '%';
        vueCanvas.textAlign = 'center';
        vueCanvas.fillText(text, vueCanvas.canvas.width / 2, vueCanvas.canvas.height / 2 + 25);
        vueCanvas.strokeText(text, vueCanvas.canvas.width / 2, vueCanvas.canvas.height / 2 + 26);
      }
    },
    updateBalls() {
      balls = [];
      this.generateBalls();
    },
    increaseHealthBusy() {
      this.healthBusy++;
    },
    decreaseHealthBusy() {
      this.healthBusy--;
    },
    isHealthFull() {
      return this.healthBusy >= this.healthCapacity;
    },
    updateSparkline(id, chartType, agesDistribution) {
      const spk = document.getElementById(id);
      spk.removeChild(spk.lastElementChild);
      const ComponentClass = Vue.extend(Sparkline);
      const instance = new ComponentClass({
        propsData: { agesDistribution, agesDistributionLabel: this.agesDistributionLabel, chartType }
      });
      instance.$mount();
      spk.appendChild(instance.$el);
      this.updateBalls();
    },
    increaseAgeDist(index) {
      if (this.agesDistribution[index] < 10) {
        this.agesDistribution[index]++;
        this.updateSparkline('agesSparkline', 'ageDist', this.agesDistribution);
      }
    },
    increaseFatalityAgeDist(index) {
      if (this.fatalityAgesDistribution[index] < 100) {
        this.fatalityAgesDistribution[index]++;
        this.updateSparkline('fatalityParkline', 'fatalityDist', this.fatalityAgesDistribution);
      }
    },
    decreaseAgeDist(index) {
      if (this.agesDistribution[index] > 1) {
        this.agesDistribution[index]--;
        this.updateSparkline('agesSparkline', 'ageDist', this.agesDistribution);
      }
    },
    decreaseFatalityAgeDist(index) {
      if (this.fatalityAgesDistribution[index] > 0) {
        this.fatalityAgesDistribution[index]--;
        this.updateSparkline('fatalityParkline', 'fatalityDist', this.fatalityAgesDistribution);
      }
    },
    applyConfinement() {
      for (let i = 0; i < balls.length; i++) {
        balls[i].confinated = false;
        if (this.confinement !== 'no' && balls[i].obey) {
          if (this.confinement === 'full') balls[i].confinated = true;
          if (this.confinement === 'partial') balls[i].confinated = Math.random() > 0.5;
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.div-canvas {
  text-align: center;
  min-height: 600px;
  overflow: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
}
canvas {
  border: 1px solid white;
  background: white;
}
</style>
