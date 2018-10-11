"use strict";

// 旋转速度
var rotateSpeed = 50 / 60 * Math.PI / 180;

// 基本要素
var scene = null;
var camera = null;
var renderer = null;

// 苹果本体
var appleMesh = null;
var appleMtl = null;
// 茎
var stemMesh = null;
var stemMtl = null;
// 整体
var groupMesh = null;
var centerPivot = null;

// 光源
var keyLight = null;

// shader
var vs = undefined;
var fs = undefined;

function isPC() {
  var userAgentInfo = navigator.userAgent;
  var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false;break;
    }
  }
  return flag;
}

function init() {
  var canvas = document.getElementById("mainCanvas");

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true });
  renderer.setClearColor(1183001);

  scene = new THREE.Scene();

  // 相机
  camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height, 10, 10000);
  camera.position.set(0, 0, 150);
  camera.target = new THREE.Vector3(0, 0, 0);
  scene.add(camera);

  // 聚光灯光源
  keyLight = new THREE.SpotLight(16777215, 1, 5000, Math.PI / 6, 25);
  keyLight.position.set(100, 50, 350);
  keyLight.target.position.set(0, 0, 0);
  scene.add(keyLight);

  // 加载模型
  var objLoader = new THREE.OBJLoader();
  objLoader.setPath("../model/");
  objLoader.load("apple.obj", function (obj) {
    // 加载shader
    $.get("../shader/cartoon.vs", function (v) {
      $.get("../shader/cartoon.fs", function (f) {
        vs = v;
        fs = f;
      });
    });

    obj.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        if (!appleMesh) {
          appleMesh = child;
          appleMtl = appleMesh.material;
        } else {
          stemMesh = child;
          stemMtl = stemMesh.material;
        }
      }
    });

    groupMesh = obj;
    groupMesh.position.set(-60, -30, 0);
    // 与中心点绑定
    centerPivot = new THREE.Object3D();
    centerPivot.add(groupMesh);
    centerPivot.rotateX(30 * Math.PI / 180);

    useShader();
    scene.add(centerPivot);
    // 开始动画
    tick();
  });
}

function update() {
  useShader();
  // 旋转跳跃
  centerPivot.rotateY(rotateSpeed);
}

// 每帧绘制
function tick() {
  update();
  draw();
  requestAnimationFrame(tick);
}

function draw() {
  renderer.render(scene, camera);
}

// 使用着色器
function useShader() {
  var lightUniform = {
    type: "v3",
    // 这里是世界坐标系下的位置
    value: keyLight.position
  };

  setShader(appleMesh, {
    uniforms: {
      color: {
        type: "v3",
        value: new THREE.Color("#ff0a85")
      },
      light: lightUniform }
  });
  setShader(stemMesh, {
    uniforms: {
      color: {
        type: "v3",
        value: new THREE.Color("#09fffa")
      },
      light: lightUniform }
  });

  function setShader(mesh, qualifiers) {
    // 自定义shader!!!!
    var material = new THREE.ShaderMaterial({
      vertexShader: vs,
      fragmentShader: fs,
      uniforms: qualifiers.uniforms });
    mesh.material = material;
  }
}

if (isPC()) {
  init();
}
// 抗锯齿