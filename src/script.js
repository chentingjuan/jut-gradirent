import * as THREE from 'three'
import fragment from './shader/fragment.js'
import vertex from './shader/vertex.js'

import { dataRule, getFormattedWeather } from './getFormattedWeather'

import dat from 'dat.gui'

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function rgb(r, g, b) {
  return new THREE.Vector3(r, g, b)
}

var R = function(x, y, t) {
  return( Math.floor(192 + 64*Math.cos( (x*x-y*y)/300 + t )) )
}

var G = function(x, y, t) {
  return( Math.floor(192 + 64*Math.sin( (x*x*Math.cos(t/4)+y*y*Math.sin(t/3))/300 ) ) )
}

var B = function(x, y, t) {
  return( Math.floor(192 + 64*Math.sin( 5*Math.sin(t/9) + ((x-100)*(x-100)+(y-100)*(y-100))/1100) ))
}

let t = 0
let j = 0
let x = randomInteger(0, 32)
let y = randomInteger(0, 32)


class Sketch {

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true })
    this.renderer.setSize( window.innerWidth, window.innerHeight )
    document.body.appendChild( this.renderer.domElement )
    
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
    this.camera.position.z = 5

    const setup = async () => {
      const data = await getFormattedWeather()
      console.log(data)
      this.initSettings(data)

      this.vCheck = false;

      var randomisePosition = new THREE.Vector2(1, 2);

      let geometry = new THREE.PlaneGeometry(window.innerWidth / 2, 400, 100, 100);
      let material = new THREE.ShaderMaterial({
        uniforms: {
            // u_bg: {type: 'v3', value: rgb(160, 235, 235)},
            // u_bg: {type: 'v3', value: rgb(230, 230, 230)},
            // u_bgMain: {type: 'v3', value: rgb(42, 146, 239)}, // 藍
            // u_color1: {type: 'v3', value: rgb(192, 242, 9)}, //率
            // u_color2: {type: 'v3', value: rgb(255, 206, 32)}, //黃
            // u_bgMain: {type: 'v3', value: rgb(42,146,239)}, // 藍
            // u_color1: {type: 'v3', value: rgb(255,206,32)}, //率
            // u_color2: {type: 'v3', value: rgb(195,242,9)}, //黃
            u_velocity_g: {type: 'f', value: this.settings['velocity (G)']},
            u_velocity_b: {type: 'f', value: this.settings['velocity (B)']},
            u_wavelength_g: {type: 'f', value: this.settings['wavelength (G)']},
            u_wavelength_b: {type: 'f', value: this.settings['wavelength (B)']},
            u_color_depth_g: {type: 'f', value: this.settings['color depth (G)']},
            u_color_depth_b: {type: 'f', value: this.settings['color depth (B)']},
            u_color_depth_o: {type: 'f', value: 0},
            u_light_offset: {type: 'f', value: 1},
            u_time: {type: 'f', value: 30},
            u_randomisePosition: { type: 'v2', value: randomisePosition }
        },
        fragmentShader: fragment,
        vertexShader: vertex,
        transparent: true,
      });

      this.mesh = new THREE.Mesh(geometry, material);
      // this.mesh.position.set(-200, 270, -280);
      this.mesh.position.set(0, 0, -280);
      this.mesh.scale.multiplyScalar(3)
      this.scene.add(this.mesh);

      this.renderer.render( this.scene, this.camera );

      this.animate()
    }
    setup()
  }

  initSettings = ({
    wind_deg,
    wind_speed,
    humidity,
    temp
  }) => {
    this.settings = {
      'bearing': 0,
      'sunlight': false,
      'velocity (G)': .12,
      'velocity (B)': .009,
      'velocity 3': 0,
      'wavelength (G)': 2,
      'color depth (G)': 1,
      'wavelength (B)': 4,
      'color depth (B)': .9,

      'wind deg(deg)': wind_deg, // 0 - 360 deg
      'wind spe(m/s)': wind_speed, // 0 - 15 m/s
      'humidity(%)': humidity, // 60 - 90%
      'temp(°C)': temp, // 15 - 40°C
      'btr tmro': 0, // 0 - 100
		}

    this.gui = new dat.GUI()
    // this.gui.add(this.settings, 'sunlight')
    // this.gui.add(this.settings, 'bearing').min(-1 * Math.PI).max(Math.PI)
    // this.gui.add(this.settings, 'velocity 3').min(-0.01).max(0.01)

    // const greenFolder = this.gui.addFolder('----- MAIN GREEN -----')
    // greenFolder.open()
    // greenFolder.add(this.settings, 'velocity (G)').min(-0.5).max(0.5)
    // greenFolder.add(this.settings, 'wavelength (G)').min(1).max(6)
    // greenFolder.add(this.settings, 'color depth (G)').min(0.4).max(2)

    // const blueFolder = this.gui.addFolder('----- MAIN BLUE -----')
    // blueFolder.open()
    // blueFolder.add(this.settings, 'velocity (B)').min(-0.5).max(0.5)
    // blueFolder.add(this.settings, 'wavelength (B)').min(1).max(6)
    // blueFolder.add(this.settings, 'color depth (B)').min(0.4).max(2)

    this.gui.add(this.settings, 'wind deg(deg)').min(dataRule.wind_deg.min).max(dataRule.wind_deg.max)
    this.gui.add(this.settings, 'wind spe(m/s)').min(dataRule.wind_speed.min).max(dataRule.wind_speed.max)
    this.gui.add(this.settings, 'humidity(%)').min(dataRule.humidity.min).max(dataRule.humidity.max)
    this.gui.add(this.settings, 'temp(°C)').min(dataRule.temp.min).max(dataRule.temp.max)
    this.gui.add(this.settings, 'btr tmro').min(0).max(100)
  }

  animate = () => {
    requestAnimationFrame( this.animate )
    this.renderer.render( this.scene, this.camera )
    this.mesh.material.uniforms.u_randomisePosition.value = new THREE.Vector2(j, j);
    
    // this.mesh.material.uniforms.u_color1.value = new THREE.Vector3(R(x,y,t/2), G(x,y,t/2), B(x,y,t/2));

    // this.mesh.material.uniforms.u_velocity_g.value = this.settings['velocity (G)']
    // this.mesh.material.uniforms.u_velocity_b.value = this.settings['velocity (B)']
    this.mesh.material.uniforms.u_velocity_g.value = this.settings['wind spe(m/s)'] / 40
    this.mesh.material.uniforms.u_velocity_b.value = this.settings['wind spe(m/s)'] / 60

    this.mesh.material.uniforms.u_wavelength_g.value = this.settings['wavelength (G)']
    this.mesh.material.uniforms.u_wavelength_b.value = this.settings['wavelength (B)']

    // this.mesh.material.uniforms.u_color_depth_g.value = this.settings['color depth (G)']
    // this.mesh.material.uniforms.u_color_depth_b.value = this.settings['color depth (B)']
    this.mesh.material.uniforms.u_color_depth_g.value = (this.settings['humidity(%)'] - dataRule.humidity.min) / 60 + .88
    this.mesh.material.uniforms.u_color_depth_b.value = (this.settings['humidity(%)'] - dataRule.humidity.min) / 70 + .88

    this.mesh.material.uniforms.u_color_depth_o.value = (this.settings['temp(°C)'] - dataRule.temp.min) / (dataRule.temp.max - dataRule.temp.min)

    // this.mesh.material.uniforms.u_light_offset.value = this.settings['sunlight'] ? 0 : 1
    this.mesh.material.uniforms.u_light_offset.value = 1 - this.settings['btr tmro'] / 120

    this.mesh.material.uniforms.u_time.value = t;
    if(t % 0.1 == 0) {         
      if(this.vCheck == false) {
          x -= 1;
          if(x <= 0) {
              this.vCheck = true;
          }
      } else {
          x += 1;
          if(x >= 32) {
              this.vCheck = false;
          }

      }
    }

    // this.mesh.rotation.z = this.settings['bearing']
    // this.mesh.rotation.z = (- this.settings['wind deg(deg)'] + 45) * Math.PI/180
    this.mesh.rotation.z = (- this.settings['wind deg(deg)'] + 90) * Math.PI/180

    // Increase t by a certain value every frame
    // j = j + this.settings['velocity 3'];
    j = j + 0.005;
    t = t + 0.05;
  };
  
  
}

export default Sketch