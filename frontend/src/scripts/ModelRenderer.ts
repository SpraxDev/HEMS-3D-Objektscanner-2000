import * as Three from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';

export const CUBE_POINTS: Three.Vector3[] = [
  new Three.Vector3(-1, -1, -1),
  new Three.Vector3(1, -1, -1),
  new Three.Vector3(1, 1, -1),
  new Three.Vector3(-1, 1, -1),
  new Three.Vector3(-1, -1, 1),
  new Three.Vector3(1, -1, 1),
  new Three.Vector3(1, 1, 1),
  new Three.Vector3(-1, 1, 1)
];

export default class ModelRenderer {
  private readonly canvas: HTMLCanvasElement;

  private readonly scene = new Three.Scene();
  private readonly objGroup: Three.Group;

  private readonly renderer: Three.WebGLRenderer;
  private readonly camera: Three.PerspectiveCamera;
  private readonly controls: OrbitControls;

  private measurementData: number[][];
  private objectMesh: Three.Mesh;

  constructor(canvas: HTMLCanvasElement, measurementData: number[][], enableControls: boolean = false) {
    this.canvas = canvas;
    this.measurementData = measurementData;

    this.objGroup = new Three.Group();
    this.scene.add(this.objGroup);

    this.camera = new Three.PerspectiveCamera();
    this.scene.add(this.camera);

    this.renderer = new Three.WebGLRenderer({ antialias: true, canvas });
    this.controls = new OrbitControls(this.camera, this.canvas);

    this.controls.enabled = enableControls;

    this.init();
  }

  triggerExportDownload(fileName: string = 'model'): void {
    const exporter = new STLExporter();
    const stlString = exporter.parse(this.objectMesh, { binary: false });

    const blob = new Blob([stlString], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.stl`;
    link.click();
  }

  destroy(): void {
    this.scene.clear();

    this.renderer.setAnimationLoop(() => {
      this.renderer.render(this.scene, this.camera);
      this.renderer.setAnimationLoop(null);
    });
  }

  private init() {
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.canvas.width, this.canvas.height);

    this.scene.add(new Three.AmbientLight(0x404040));
    this.scene.add(new Three.AxesHelper(20));

    const light = new Three.PointLight(0xffffff, 1);
    light.position.set(50, 50, 50);
    this.camera.add(light);

    // var ptsGeom = new Three.BufferGeometry().setFromPoints(this.points);
    // var ptsMat = new Three.PointsMaterial({ size: 0.25, color: 'aqua' });
    // var points = new Three.Points(ptsGeom, ptsMat);
    // this.objGroup.add(points);

    this.objectMesh = this.createMeshForMeasurementData(this.measurementData);
    this.objGroup.add(this.objectMesh);

    this.configureCamera();
    this.renderer.setAnimationLoop(() => {
      this.objectMesh.rotateY(0.001);
      this.renderer.render(this.scene, this.camera);
    });
  }

  /**
   * @author Big thanks to @NudelErde (https://github.com/NudelErde) <3
   */
  // **rawData = 0 => 0 distance measured
  // **rawData = 1 => distance measured = distance to center
  private createMeshForMeasurementData(rawData: number[][]): Three.Mesh {
    const geometry = new Three.BufferGeometry();
    const position_data: number[] = [];
    const normal_data: number[] = [];

    type point = { x: number, y: number, z: number };

    const push_point = (a: point, array: number[]) => {
      const { x, y, z } = a;
      array.push(x);
      array.push(y);
      array.push(z);
    }
    const push_triangle = (a: point, b: point, c: point) => {
      push_point(a, position_data);
      push_point(b, position_data);
      push_point(c, position_data);
      const x_1 = a.x - b.x;
      const x_2 = a.x - c.x;
      const y_1 = a.y - b.y;
      const y_2 = a.y - c.y;
      const z_1 = a.z - b.z;
      const z_2 = a.z - c.z;

      const n_x = y_1 * z_2 - y_2 * z_1;
      const n_y = x_1 * z_2 - x_2 * z_1;
      const n_z = y_1 * x_2 - y_2 * x_1;

      push_point({ x: n_x, y: n_y, z: n_z }, normal_data);
      push_point({ x: n_x, y: n_y, z: n_z }, normal_data);
      push_point({ x: n_x, y: n_y, z: n_z }, normal_data);
    }
    const raw_to_point = (distance: number, angle: number, height: number) => {
      const rad = angle * Math.PI * 2;
      return {
        x: Math.cos(rad) * (1 - distance),
        y: height * 2, z: Math.sin(rad) * (1 - distance)
      };
    }
    const push_rect = (a: point, b: point, c: point, d: point) => {
      push_triangle(a, c, b);
      push_triangle(c, a, d);
    }

    for (let alpha = 0; alpha < rawData.length; ++alpha) {
      for (let y = 0; y < rawData[alpha].length - 1; ++y) {
        const next_alpha = (alpha == rawData.length - 1) ? 0 : alpha + 1;
        const a = raw_to_point(rawData[alpha][y], alpha / rawData.length, y / (rawData[alpha].length - 1));
        const b = raw_to_point(rawData[next_alpha][y], next_alpha / rawData.length, y / (rawData[alpha].length - 1));
        const c = raw_to_point(rawData[next_alpha][y + 1], next_alpha / rawData.length, (y + 1) / (rawData[alpha].length - 1));
        const d = raw_to_point(rawData[alpha][y + 1], alpha / rawData.length, (y + 1) / (rawData[alpha].length - 1));
        push_rect(a, b, c, d);
      }
    }

    let start = raw_to_point(1, -0.01, 0);
    for (let alpha = 0; alpha < rawData.length; ++alpha) {
      const next_alpha = (alpha == rawData.length - 1) ? 0 : alpha + 1;

      const a = raw_to_point(rawData[alpha][0], alpha / rawData.length, 0);
      const b = raw_to_point(rawData[next_alpha][0], next_alpha / rawData.length, 0);

      push_triangle(start, a, b);
    }

    start = raw_to_point(1, 0, 1.01);
    for (let alpha = 0; alpha < rawData.length; ++alpha) {
      const next_alpha = (alpha == rawData.length - 1) ? 0 : alpha + 1;

      const a = raw_to_point(rawData[alpha][rawData[alpha].length - 1], alpha / rawData.length, 1);
      const b = raw_to_point(rawData[next_alpha][rawData[alpha].length - 1], next_alpha / rawData.length, 1);

      push_triangle(start, b, a);
    }

    geometry.setAttribute('position', new Three.BufferAttribute(new Float32Array(position_data), 3));
    geometry.setAttribute('normal', new Three.BufferAttribute(new Float32Array(normal_data), 3));
    const material = new Three.MeshNormalMaterial();
    material.side = Three.DoubleSide;

    return new Three.Mesh(geometry, material);
  }

  private configureCamera(): void {
    const boundingBox = new Three.Box3().setFromObject(this.objGroup);
    const boundingBoxSize = boundingBox.getSize(new Three.Vector3()).length();
    const boundingBoxCenter = boundingBox.getCenter(new Three.Vector3());

    this.camera.position.set(1, 1.5, 1);
    ModelRenderer.configureCameraToLookAtObject(this.camera, boundingBoxSize, boundingBoxCenter, this.canvas.width / this.canvas.height);

    this.controls.maxDistance = boundingBoxSize * 2;
    this.controls.target.copy(boundingBoxCenter);
    this.controls.update();
  }

  private static configureCameraToLookAtObject(camera: Three.PerspectiveCamera, boxSize: number, boxCenter: Three.Vector3, cameraAspect: number): void {
    const sizeToFit = boxSize * 1.2;
    const halfSizeToFit = sizeToFit * 0.5;
    const halfFovY = Three.MathUtils.degToRad(camera.fov * .5);
    const distance = halfSizeToFit / Math.tan(halfFovY);
    const direction = new Three.Vector3().subVectors(camera.position, boxCenter).normalize();

    camera.fov = 40;
    camera.aspect = cameraAspect;

    camera.position.copy(direction.multiplyScalar(distance * 5).add(boxCenter));
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;
    camera.updateProjectionMatrix();

    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
  }

  static generateRandomMeasurementData(): number[][] {
    const measurementData: number[][] = [];

    for (let i = 0; i < 50; ++i) {
      for (let j = 0; j < 50; ++j) {
        if (!measurementData[i]) {
          measurementData[i] = [];
        }

        measurementData[i][j] = Math.random() / 10;
      }
    }

    return measurementData;
  }
}
