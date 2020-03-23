<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <h1>A simple virus simulator</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="col-canvas" cols="12" md="6" lg="7">
        <div id="simulation-section">
          <div class="div-canvas">
            <canvas id="c"></canvas>
          </div>
          <v-bottom-navigation>
            <div class="d-flex mr-auto">
              <v-btn @click="stop = !stop">
                <span v-if="stop">Play</span>
                <span v-if="!stop">Pause</span>
                <v-icon v-if="stop" dark>mdi-play</v-icon>
                <v-icon v-if="!stop" dark>mdi-pause</v-icon>
              </v-btn>
              <v-btn @click="updateBalls()">
                <span>Restart</span>
                <v-icon dark>mdi-cached</v-icon>
              </v-btn>
              <v-menu v-model="legendMenu" :close-on-content-click="false" offset-x max-width="520px">
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on">
                    <span>Legend</span>
                    <v-icon dark>mdi-information</v-icon>
                  </v-btn>
                </template>
                <v-card flat>
                  <v-card-text>
                    <v-row>
                      <v-col cols="6" align-self="center">
                        <v-icon color="white">mdi-checkbox-blank-circle</v-icon>
                        <v-label>Healthy</v-label>
                      </v-col>
                      <v-col cols="6" align-self="center">
                        <v-icon color="blue">mdi-checkbox-blank-circle</v-icon>
                        <v-label>Recovered & immunized</v-label>
                      </v-col>
                      <v-col cols="6" align-self="center">
                        <v-icon color="orange">mdi-checkbox-blank-circle</v-icon>
                        <v-label>Infected & incubation period</v-label>
                      </v-col>
                      <v-col cols="6" align-self="center">
                        <v-icon color="red">mdi-checkbox-blank-circle</v-icon>
                        <v-label>Infected & symptomatic</v-label>
                      </v-col>
                      <v-col cols="6" align-self="center">
                        <v-icon color="red">mdi-close-thick</v-icon>
                        <v-label>Dead</v-label>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-menu>
              <v-menu v-model="actionsMenu" :close-on-content-click="false" :nudge-width="200" offset-x>
                <template v-slot:activator="{ on }">
                  <v-btn v-on="on">
                    <span>Actions</span>
                    <v-icon dark>mdi-flash</v-icon>
                  </v-btn>
                </template>
                <v-card flat>
                  <v-card-text>
                    <v-row>
                      <v-col>
                        <v-label dark>Confinement</v-label>
                        <v-radio-group v-model="confinement" row @change="applyConfinement()">
                          <v-radio label="No" color="primary" value="no"></v-radio>
                          <v-radio label="Partial" color="secondary" value="partial"></v-radio>
                          <v-radio label="Full" color="error" value="full"></v-radio>
                        </v-radio-group>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-menu>
            </div>
          </v-bottom-navigation>
          <v-bottom-navigation background-color="#4c4c4c">
            <div class="d-flex mr-auto">
              <v-btn disabled>
                <span>Days</span>
                <span class="title">{{ days }}</span>
              </v-btn>
            </div>
            <div class="d-flex ml-auto">
              <v-btn disabled>
                <span>Recovered</span>
                <v-progress-circular :size="40" :value="getImmunizedPercent" color="blue">
                  {{ getImmunizedPercent }}%
                </v-progress-circular>
              </v-btn>

              <v-btn disabled>
                <span>Infected</span>
                <v-progress-circular :size="40" :value="getInfectedPercent" color="orange">
                  {{ getInfectedPercent }}%
                </v-progress-circular>
              </v-btn>

              <v-btn disabled>
                <span>Dead</span>
                <v-progress-circular :size="40" :value="getDeadPercent" color="red">
                  {{ getDeadPercent }}%
                </v-progress-circular>
              </v-btn>
            </div>
          </v-bottom-navigation>
        </div>
      </v-col>
      <v-col class="col-chart" cols="12" md="6" lg="5">
        <v-row>
          <zingchart ref="chart" :data="chartDataEveryDay"></zingchart>
        </v-row>
        <v-row>
          <zingchart ref="chart" :data="chartDataAccumulated"></zingchart>
        </v-row>
        <v-row>
          <zingchart ref="chart" :data="chartDataDead"></zingchart>
        </v-row>
      </v-col>
      <v-col cols="12">
        <v-card light>
          <v-tabs v-model="active_tab" centered icons-and-text>
            <v-tabs-slider></v-tabs-slider>
            <v-tab href="#tab-scenario">
              Scenario config
              <v-icon>mdi-earth</v-icon>
            </v-tab>
            <v-tab href="#tab-virus">
              Virus config
              <v-icon>mdi-pac-man</v-icon>
            </v-tab>
          </v-tabs>
          <v-tabs-items v-model="active_tab" light>
            <v-tab-item :value="'tab-scenario'">
              <v-card flat>
                <v-card-text>
                  <v-label light>Population</v-label>
                  <v-slider
                    v-model="ballsNum"
                    step="100"
                    min="100"
                    max="1000"
                    ticks="always"
                    thumb-label="always"
                    tick-size="4"
                    @change="updateBalls()"
                  ></v-slider>
                  <v-label light>Obedience Rate</v-label>
                  <v-slider
                    v-model="obedienceRate"
                    step="5"
                    min="0"
                    max="100"
                    ticks="always"
                    thumb-label="always"
                    tick-size="4"
                    @change="updateBalls()"
                  ></v-slider>
                  <v-label light>Health Capacity</v-label>
                  <v-slider
                    v-model="healthCapacityPercent"
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
                  <v-label light>Propagation</v-label>
                  <v-slider v-model="propagation" :tick-labels="propagationLabels" :max="4" tick-size="4"></v-slider>
                  <v-label light>Incubation time (days)</v-label>
                  <v-range-slider
                    v-model="incubationTime"
                    class="align-center"
                    :max="30"
                    :min="1"
                    thumb-label="always"
                    ticks="always"
                    @change="updateBalls()"
                  >
                  </v-range-slider>
                  <v-label light>Symptomatic time (days)</v-label>
                  <v-range-slider
                    v-model="symptomaticTime"
                    class="align-center"
                    :max="25"
                    :min="3"
                    thumb-label="always"
                    ticks="always"
                    @change="updateBalls()"
                  >
                  </v-range-slider>
                  <v-label light>Severity</v-label>
                  <v-slider
                    v-model="severity"
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
const currentFps = [20, 30, 60];
const fpsMult = [3, 2, 1];
let fpsInterval, now, then, elapsed;

export default {
  components: { Sparkline },
  data() {
    return {
      actionsMenu: false,
      legendMenu: false,
      stop: true,
      fpsRatio: 1,
      days: 0,
      currentFrame: 0,
      active_tab: 'tab-legend',
      mapWidth: 1100,
      mapHeight: 600,
      ballsNum: 600,
      obedienceRate: 90,
      agesDistribution: [3, 3, 4, 5, 6, 6, 3, 2, 1],
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
      infected: 0,
      incubatingRegister: [],
      incubating: 0,
      symptomaticRegister: [],
      symptomatic: 0,
      deadAcumulatedRegister: [],
      deadToday: [],
      deadInHospital: [0],
      deadAtHome: [0],
      immunized: 0,
      presets: [
        {
          name: 'COVID19',
          fatalityAgesDistribution: [0, 0, 0, 0, 1, 1, 3, 8, 15],
          severity: 2,
          incubationTime: [2, 11]
        }
      ]
    };
  },
  computed: {
    getInfectedPercent() {
      const infectedPercent = (this.infected / this.ballsNum) * 100;
      if (infectedPercent > 10) return infectedPercent.toFixed(0);
      else return infectedPercent.toFixed(1);
    },
    getImmunizedPercent() {
      const immunizedPercent = (this.immunized / this.ballsNum) * 100;
      if (immunizedPercent > 10) return immunizedPercent.toFixed(0);
      else return immunizedPercent.toFixed(1);
    },
    getDeadPercent() {
      if (this.deadAcumulatedRegister.length === 0) return 0;
      const deadPercent = (this.deadAcumulatedRegister[this.deadAcumulatedRegister.length - 1] / this.ballsNum) * 100;
      if (deadPercent > 10) return deadPercent.toFixed(0);
      else return deadPercent.toFixed(1);
    },
    chartDataEveryDay() {
      return {
        title: { text: 'Total of active cases', 'adjust-layout': true },
        type: 'line',
        legend: {
          layout: 'float',
          'background-color': 'none',
          'border-width': 0,
          shadow: 0,
          align: 'center',
          'adjust-layout': true,
          'toggle-action': 'remove',
          item: {
            padding: 7,
            marginRight: 10,
            cursor: 'hand'
          }
        },
        plotarea: {
          margin: 'dynamic 45 60 dynamic'
        },
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
            text: 'Infected (' + this.infected + ')',
            aspect: 'spline',
            'line-color': '#007790',
            'legend-item': {
              'background-color': '#007790',
              borderRadius: 5,
              'font-color': 'white'
            },
            'legend-marker': {
              visible: false
            },
            marker: {
              'background-color': '#007790',
              'border-width': 1,
              shadow: 0,
              'border-color': '#69dbf1'
            },
            'highlight-marker': {
              size: 6,
              'background-color': '#007790'
            }
          },
          {
            values: this.incubatingRegister,
            backgroundColor: 'orange',
            text: 'Incubating (' + this.incubating + ')',
            aspect: 'spline',
            'line-color': '#009872',
            'legend-item': {
              'background-color': '#009872',
              borderRadius: 5,
              'font-color': 'white'
            },
            'legend-marker': {
              visible: false
            },
            marker: {
              'background-color': '#009872',
              'border-width': 1,
              shadow: 0,
              'border-color': '#69f2d0'
            },
            'highlight-marker': {
              size: 6,
              'background-color': '#009872'
            }
          },
          {
            values: this.symptomaticRegister,
            backgroundColor: 'red',
            text: 'Symptomatic (' + this.symptomatic + ')',
            aspect: 'spline',
            'line-color': '#da534d',
            'legend-item': {
              'background-color': '#da534d',
              borderRadius: 5,
              'font-color': 'white'
            },
            'legend-marker': {
              visible: false
            },
            marker: {
              'background-color': '#da534d',
              'border-width': 1,
              shadow: 0,
              'border-color': '#faa39f'
            },
            'highlight-marker': {
              size: 6,
              'background-color': '#da534d'
            }
          }
          // {
          //   values: this.deadToday,
          //   backgroundColor: 'black',
          //   text: 'Dead',
          //   type: 'bar'
          // }
        ]
      };
    },
    chartDataAccumulated() {
      return {
        title: { text: 'Total accumulated cases', 'adjust-layout': true },
        type: 'area',
        legend: {
          layout: 'float',
          'background-color': 'none',
          'border-width': 0,
          shadow: 0,
          align: 'center',
          'adjust-layout': true,
          'toggle-action': 'remove',
          item: {
            padding: 7,
            marginRight: 10,
            cursor: 'hand'
          }
        },
        plotarea: {
          margin: 'dynamic 45 60 dynamic'
        },
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
            aspect: 'spline',
            'line-color': '#007790',
            'legend-item': {
              'background-color': '#007790',
              borderRadius: 5,
              'font-color': 'white'
            },
            'legend-marker': {
              visible: false
            },
            marker: {
              'background-color': '#007790',
              'border-width': 1,
              shadow: 0,
              'border-color': '#69dbf1'
            },
            'highlight-marker': {
              size: 6,
              'background-color': '#007790'
            }
          },
          {
            values: this.deadAcumulatedRegister,
            backgroundColor: 'red',
            text: 'Deaths',
            aspect: 'spline',
            'line-color': '#da534d',
            'legend-item': {
              'background-color': '#da534d',
              borderRadius: 5,
              'font-color': 'white'
            },
            'legend-marker': {
              visible: false
            },
            marker: {
              'background-color': '#da534d',
              'border-width': 1,
              shadow: 0,
              'border-color': '#faa39f'
            },
            'highlight-marker': {
              size: 6,
              'background-color': '#da534d'
            }
          }
        ]
      };
    },
    chartDataDead() {
      return {
        title: { text: 'Healthcare (deaths)', 'adjust-layout': true },
        type: 'pie',
        legend: {
          layout: 'float',
          'background-color': 'none',
          'border-width': 0,
          shadow: 0,
          align: 'center',
          'adjust-layout': true,
          'toggle-action': 'remove',
          item: {
            padding: 7,
            marginRight: 10,
            cursor: 'hand'
          }
        },
        plotarea: {
          margin: 'dynamic 45 60 dynamic'
        },
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
            values: this.deadInHospital,
            text: 'Inside Healthcare',
            backgroundColor: '#007790',
            aspect: 'spline',
            'line-color': '#007790',
            'legend-item': {
              'background-color': '#007790',
              borderRadius: 5,
              'font-color': 'white'
            },
            'legend-marker': {
              visible: false
            },
            marker: {
              'background-color': '#007790',
              'border-width': 1,
              shadow: 0,
              'border-color': '#69dbf1'
            },
            'highlight-marker': {
              size: 6,
              'background-color': '#007790'
            }
          },
          {
            values: this.deadAtHome,
            text: 'Outside Healthcare',
            backgroundColor: '#da534d',
            aspect: 'spline',
            'line-color': '#da534d',
            'legend-item': {
              'background-color': '#da534d',
              borderRadius: 5,
              'font-color': 'white'
            },
            'legend-marker': {
              visible: false
            },
            marker: {
              'background-color': '#da534d',
              'border-width': 1,
              shadow: 0,
              'border-color': '#faa39f'
            },
            'highlight-marker': {
              size: 6,
              'background-color': '#da534d'
            }
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
      let immunized = 0;
      for (let i = 0; i < balls.length; i++) {
        if (balls[i].infected) infected++;
        if (balls[i].died) dead++;
        if (balls[i].diedInHospital) deadInHospital++;
        if (balls[i].incubating) incubating++;
        if (balls[i].symptomatic) symptomatic++;
        if (balls[i].immunized) immunized++;
        if (balls[i].infected || balls[i].immunized || balls[i].died) infectedAcumulated++;
      }
      if (infected > 0) {
        if (this.deadAcumulatedRegister.length > 0) {
          const deadToday = dead - this.deadAcumulatedRegister[this.deadAcumulatedRegister.length - 1];
          this.deadToday.push(deadToday);
        } else {
          this.deadToday.push(0);
        }
        this.infected = infected;
        this.incubating = incubating;
        this.symptomatic = symptomatic;
        this.immunized = immunized;
        this.deadInHospital.pop();
        this.deadInHospital.push(deadInHospital);
        this.deadAtHome.pop();
        this.deadAtHome.push(dead - deadInHospital);
        this.infectedRegister.push(infected);
        this.deadAcumulatedRegister.push(dead);
        this.incubatingRegister.push(incubating);
        this.symptomaticRegister.push(symptomatic);
        this.infectedAcumulatedRegister.push(infectedAcumulated);
      } else this.infected = 0;
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
    this.adjustChartSection();
    window.addEventListener('resize', this.adjustChartSection);
  },
  methods: {
    adjustChartSection() {
      const offsetHeight = document.getElementById('simulation-section').offsetHeight;
      document.getElementsByClassName('col-chart')[0].style.height = offsetHeight + 'px';
    },
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
@import '@/assets/variables.scss';
html {
  background-color: #121212 !important;
}

.col-chart {
  overflow-y: auto;
  padding-top: 0;
  margin-top: 12px;
}
.col-canvas {
  .v-btn:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) {
    background-color: inherit !important;
  }
  .v-btn {
    @media screen and (max-width: $break-md) {
      padding: 0 0px;
    }
  }
}

.div-canvas {
  text-align: center;
  overflow: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
}
canvas {
  border: 1px solid white;
  background: white;
  width: 100%;
  max-width: 1100px;
}
</style>
