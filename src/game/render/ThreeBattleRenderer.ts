import {
    AmbientLight,
    BoxGeometry,
    Color,
    DirectionalLight,
    DynamicDrawUsage,
    InstancedMesh,
    Material,
    Matrix4,
    Mesh,
    MeshStandardMaterial,
    PerspectiveCamera,
    PlaneGeometry,
    Quaternion,
    Scene,
    SphereGeometry,
    Vector3,
    WebGLRenderer
} from 'three';
import { TugPrototypeSim } from '../sim/prototypeSim';

interface ThreeBattleRendererConfig
{
    parentElement: HTMLElement;
    width: number;
    height: number;
    arenaWidth: number;
    arenaHeight: number;
    corePadding: number;
    coreRadius: number;
    coreHpMax: number;
    maxEntities: number;
}

const TEAM_PLAYER = 0;
const LAYER_FLYING = 1;
const PLAYER_COLOR = 0x1fad4f;
const ENEMY_COLOR = 0xd12b2b;
const CORE_COLOR = 0x4a90e2;
const GROUND_COLOR = 0x1b2026;
const FLIGHT_HEIGHT = 28;
const CAMERA_MIN_DISTANCE = 260;
const CAMERA_MAX_DISTANCE = 1150;
const CAMERA_PAN_MARGIN = 48;

export class ThreeBattleRenderer
{
    private readonly host: HTMLDivElement;
    private readonly renderer: WebGLRenderer;
    private readonly scene: Scene;
    private readonly camera: PerspectiveCamera;
    private readonly playerUnits: InstancedMesh;
    private readonly enemyUnits: InstancedMesh;
    private readonly leftCore: Mesh;
    private readonly rightCore: Mesh;
    private readonly arenaWidth: number;
    private readonly arenaHeight: number;
    private readonly matrix: Matrix4;
    private readonly position: Vector3;
    private readonly rotation: Quaternion;
    private readonly scale: Vector3;
    private readonly unitRadiusScale: number;
    private readonly minGroundY: number;
    private readonly coreHpMax: number;
    private readonly cameraTarget: Vector3;
    private readonly cameraOffsetDirection: Vector3;
    private readonly cameraPanLimitX: number;
    private readonly cameraPanLimitZ: number;

    private width: number;
    private height: number;
    private cameraDistance: number;

    constructor (cfg: ThreeBattleRendererConfig)
    {
        this.width = cfg.width;
        this.height = cfg.height;
        this.arenaWidth = cfg.arenaWidth;
        this.arenaHeight = cfg.arenaHeight;
        this.unitRadiusScale = 0.52;
        this.minGroundY = 1.2;
        this.coreHpMax = Math.max(1, cfg.coreHpMax);
        this.cameraPanLimitX = Math.max(0, this.arenaWidth * 0.5 - CAMERA_PAN_MARGIN);
        this.cameraPanLimitZ = Math.max(0, this.arenaHeight * 0.5 - CAMERA_PAN_MARGIN);
        this.cameraTarget = new Vector3(0, 0, 0);
        this.cameraOffsetDirection = new Vector3(0, 470, 500).normalize();
        this.cameraDistance = Math.hypot(470, 500);

        this.host = document.createElement('div');
        this.host.style.position = 'absolute';
        this.host.style.inset = '0';
        this.host.style.zIndex = '1';
        this.host.style.pointerEvents = 'none';
        cfg.parentElement.style.position = 'relative';
        cfg.parentElement.appendChild(this.host);

        this.renderer = new WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(this.width, this.height, false);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.setClearColor(0x0d1014, 1);
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.host.appendChild(this.renderer.domElement);

        this.scene = new Scene();
        this.scene.background = new Color(0x0d1014);

        this.camera = new PerspectiveCamera(48, this.width / this.height, 1, 2500);
        this.applyCameraTransform();

        const ambient = new AmbientLight(0xffffff, 0.55);
        this.scene.add(ambient);

        const keyLight = new DirectionalLight(0xffffff, 1.05);
        keyLight.position.set(240, 520, 320);
        this.scene.add(keyLight);

        const fillLight = new DirectionalLight(0x9db6ff, 0.28);
        fillLight.position.set(-220, 260, -280);
        this.scene.add(fillLight);

        const plane = new Mesh(
            new PlaneGeometry(this.arenaWidth, this.arenaHeight),
            new MeshStandardMaterial({ color: GROUND_COLOR, metalness: 0.05, roughness: 0.95 })
        );
        plane.rotation.x = -Math.PI * 0.5;
        plane.position.y = 0;
        this.scene.add(plane);

        const borderMaterial = new MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 });
        const horizontalEdge = new BoxGeometry(this.arenaWidth, 1.2, 1.2);
        const verticalEdge = new BoxGeometry(1.2, 1.2, this.arenaHeight);
        const topEdge = new Mesh(horizontalEdge, borderMaterial);
        const bottomEdge = new Mesh(horizontalEdge, borderMaterial);
        const leftEdge = new Mesh(verticalEdge, borderMaterial);
        const rightEdge = new Mesh(verticalEdge, borderMaterial);
        topEdge.position.set(0, 0.65, -this.arenaHeight * 0.5);
        bottomEdge.position.set(0, 0.65, this.arenaHeight * 0.5);
        leftEdge.position.set(-this.arenaWidth * 0.5, 0.65, 0);
        rightEdge.position.set(this.arenaWidth * 0.5, 0.65, 0);
        this.scene.add(topEdge, bottomEdge, leftEdge, rightEdge);

        const coreGeometry = new SphereGeometry(cfg.coreRadius, 24, 18);
        const coreMaterialLeft = new MeshStandardMaterial({ color: CORE_COLOR, emissive: CORE_COLOR, emissiveIntensity: 0.3 });
        const coreMaterialRight = coreMaterialLeft.clone();
        this.leftCore = new Mesh(coreGeometry, coreMaterialLeft);
        this.rightCore = new Mesh(coreGeometry, coreMaterialRight);
        this.leftCore.position.set(-this.arenaWidth * 0.5 + cfg.corePadding, cfg.coreRadius, 0);
        this.rightCore.position.set(this.arenaWidth * 0.5 - cfg.corePadding, cfg.coreRadius, 0);
        this.scene.add(this.leftCore, this.rightCore);

        const unitGeometry = new SphereGeometry(1, 16, 12);
        const playerMaterial = new MeshStandardMaterial({
            color: PLAYER_COLOR,
            emissive: PLAYER_COLOR,
            emissiveIntensity: 0.18,
            roughness: 0.42,
            metalness: 0.08
        });
        const enemyMaterial = new MeshStandardMaterial({
            color: ENEMY_COLOR,
            emissive: ENEMY_COLOR,
            emissiveIntensity: 0.18,
            roughness: 0.42,
            metalness: 0.08
        });

        this.playerUnits = new InstancedMesh(unitGeometry, playerMaterial, cfg.maxEntities);
        this.enemyUnits = new InstancedMesh(unitGeometry, enemyMaterial, cfg.maxEntities);
        this.playerUnits.instanceMatrix.setUsage(DynamicDrawUsage);
        this.enemyUnits.instanceMatrix.setUsage(DynamicDrawUsage);
        this.playerUnits.count = 0;
        this.enemyUnits.count = 0;
        this.scene.add(this.playerUnits, this.enemyUnits);

        this.matrix = new Matrix4();
        this.position = new Vector3();
        this.rotation = new Quaternion();
        this.scale = new Vector3();
        this.rotation.identity();
    }

    render (sim: TugPrototypeSim): void
    {
        this.syncSize();
        this.updateCoreState(sim.leftCoreHp / this.coreHpMax, sim.rightCoreHp / this.coreHpMax);
        this.updateUnits(sim);
        this.renderer.render(this.scene, this.camera);
    }

    panHorizontal (deltaX: number, deltaZ: number): void
    {
        if (deltaX === 0 && deltaZ === 0)
        {
            return;
        }

        this.cameraTarget.x = Math.max(-this.cameraPanLimitX, Math.min(this.cameraPanLimitX, this.cameraTarget.x + deltaX));
        this.cameraTarget.z = Math.max(-this.cameraPanLimitZ, Math.min(this.cameraPanLimitZ, this.cameraTarget.z + deltaZ));
        this.applyCameraTransform();
    }

    zoomBy (deltaDistance: number): void
    {
        if (deltaDistance === 0)
        {
            return;
        }

        const nextDistance = Math.max(CAMERA_MIN_DISTANCE, Math.min(CAMERA_MAX_DISTANCE, this.cameraDistance + deltaDistance));
        if (nextDistance === this.cameraDistance)
        {
            return;
        }

        this.cameraDistance = nextDistance;
        this.applyCameraTransform();
    }

    destroy (): void
    {
        this.disposeMaterial(this.playerUnits.material);
        this.disposeMaterial(this.enemyUnits.material);
        this.disposeMaterial(this.leftCore.material);
        this.disposeMaterial(this.rightCore.material);

        this.playerUnits.geometry.dispose();
        this.leftCore.geometry.dispose();
        this.renderer.dispose();
        this.host.remove();
    }

    private updateUnits (sim: TugPrototypeSim): void
    {
        let playerCount = 0;
        let enemyCount = 0;

        const halfWidth = sim.arenaWidth * 0.5;
        const halfHeight = sim.arenaHeight * 0.5;

        for (let i = 0; i < sim.entityCount; i++)
        {
            if (sim.alive[i] === 0)
            {
                continue;
            }

            const radius = Math.max(1.1, sim.renderSize[i] * this.unitRadiusScale);
            const isFlying = sim.layer[i] === LAYER_FLYING;
            const y = isFlying ? FLIGHT_HEIGHT : Math.max(this.minGroundY, radius);

            this.position.set(sim.x[i] - halfWidth, y, sim.y[i] - halfHeight);
            this.scale.set(radius, radius, radius);
            this.matrix.compose(this.position, this.rotation, this.scale);

            if (sim.team[i] === TEAM_PLAYER)
            {
                this.playerUnits.setMatrixAt(playerCount, this.matrix);
                playerCount += 1;
            }
            else
            {
                this.enemyUnits.setMatrixAt(enemyCount, this.matrix);
                enemyCount += 1;
            }
        }

        this.playerUnits.count = playerCount;
        this.enemyUnits.count = enemyCount;
        this.playerUnits.instanceMatrix.needsUpdate = true;
        this.enemyUnits.instanceMatrix.needsUpdate = true;
    }

    private updateCoreState (leftRatio: number, rightRatio: number): void
    {
        const clampedLeft = Math.max(0, Math.min(1, leftRatio));
        const clampedRight = Math.max(0, Math.min(1, rightRatio));
        const leftMaterial = this.leftCore.material as MeshStandardMaterial;
        const rightMaterial = this.rightCore.material as MeshStandardMaterial;

        leftMaterial.emissiveIntensity = 0.1 + clampedLeft * 0.45;
        rightMaterial.emissiveIntensity = 0.1 + clampedRight * 0.45;
    }

    private syncSize (): void
    {
        const nextWidth = Math.max(1, this.host.clientWidth);
        const nextHeight = Math.max(1, this.host.clientHeight);
        if (nextWidth === this.width && nextHeight === this.height)
        {
            return;
        }

        this.width = nextWidth;
        this.height = nextHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height, false);
    }

    private applyCameraTransform (): void
    {
        this.camera.position.copy(this.cameraTarget).addScaledVector(this.cameraOffsetDirection, this.cameraDistance);
        this.camera.lookAt(this.cameraTarget);
    }

    private disposeMaterial (material: Material | Material[]): void
    {
        if (Array.isArray(material))
        {
            for (const item of material)
            {
                item.dispose();
            }
            return;
        }
        material.dispose();
    }
}
