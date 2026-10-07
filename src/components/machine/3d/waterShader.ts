import * as THREE from 'three';

// Fast analytical GLSL helpers without loops or permutations
const FAST_WATER_GLSL = `
// Fast harmonic caustics (zero loops, instant execution on mobile GPUs)
float fastCausticShimmer(vec2 p, float t) {
  float c1 = sin(p.x * 6.5 + t * 0.5) * sin(p.y * 6.5 - t * 0.4);
  float c2 = cos(p.x * 11.0 - t * 0.7 + p.y * 8.0) * 0.5;
  return clamp(pow(c1 * 0.5 + c2 * 0.5 + 0.5, 2.8), 0.0, 1.0);
}
`;

/**
 * 1. FRONT WATER VOLUME & MENISCUS SHADER MATERIAL (Ultra-optimized for 60fps / low power)
 * Photorealistic crystal-clear aquatic blue with smooth dynamic caustics,
 * surface meniscus, and ultra-high transparency so the prize balls and their
 * bold black lettering pop with razor-sharp fidelity with zero CPU/GPU overhead!
 */
export function createFrontWaterVolumeMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSpinSpeed: { value: 1.0 },
      uTurbulence: { value: 1.0 },
      uWaterLevel: { value: -0.22 },
      uFoamDensity: { value: 1.5 },
      uDeepColor: { value: new THREE.Color('#0284c7') },    // Rich aquatic azure blue
      uMidColor: { value: new THREE.Color('#38bdf8') },     // Luminous electric cyan-blue
      uSurfaceColor: { value: new THREE.Color('#e0f2fe') }, // Shimmering water crest highlight
      uFoamColor: { value: new THREE.Color('#ffffff') },    // Pure white soap foam
      uLightPos: { value: new THREE.Vector3(0.0, 2.2, 1.8) },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      precision mediump float;

      uniform float uTime;
      uniform float uSpinSpeed;
      uniform float uTurbulence;
      uniform float uWaterLevel;
      uniform float uFoamDensity;
      uniform vec3 uDeepColor;
      uniform vec3 uMidColor;
      uniform vec3 uSurfaceColor;
      uniform vec3 uFoamColor;
      uniform vec3 uLightPos;

      varying vec3 vWorldPosition;
      varying vec2 vUv;
      varying vec3 vNormal;

      ${FAST_WATER_GLSL}

      void main() {
        // 1. Drum boundary circular clipping (R = 2.03)
        float r = length(vWorldPosition.xy);
        if (r > 2.03) {
          discard;
        }

        // 2. Ultra-fast harmonic water surface wave (Zero noise loops)
        float wave1 = sin(vWorldPosition.x * 2.5 + uTime * 3.0 * sign(uSpinSpeed)) * 0.12 * uTurbulence;
        float wave2 = cos(vWorldPosition.x * 4.6 - uTime * 2.0) * 0.04 * abs(uSpinSpeed);
        float tilt = -vWorldPosition.x * clamp(uSpinSpeed * 0.20, -0.95, 0.95);
        float wallClimb = pow(clamp(r / 2.03, 0.0, 1.0), 2.0) * abs(uSpinSpeed) * 0.22;

        float dynamicSurfaceY = uWaterLevel + wave1 + wave2 + tilt + wallClimb;

        // Discard air above the water surface
        if (vWorldPosition.y > dynamicSurfaceY) {
          discard;
        }

        // Distance from current fragment to dynamic surface wave
        float distToSurface = dynamicSurfaceY - vWorldPosition.y;

        // 3. Dynamic Animated Caustics (Fast analytical shimmer)
        float causticPattern = fastCausticShimmer(vWorldPosition.xy, uTime) * 0.35;

        // 4. Pure white soap suds crest at the water surface meniscus
        float crestBand = smoothstep(0.18, 0.0, distToSurface);
        float foamRipple = sin(vWorldPosition.x * 24.0 + uTime * 3.2 * uSpinSpeed) * 0.5 + 0.5;
        float foamFactor = clamp(crestBand * (foamRipple * 0.5 + 0.5) * uFoamDensity, 0.0, 1.0);

        // 5. Crystal-Clear Aquatic Gradient
        float depthFactor = clamp((vWorldPosition.y + 1.9) / 1.9, 0.0, 1.0);
        vec3 waterColor = mix(uDeepColor, uMidColor, depthFactor);
        waterColor = mix(waterColor, uSurfaceColor, clamp(crestBand * 1.3, 0.0, 1.0));
        waterColor += vec3(causticPattern);

        // 6. Specular Highlight & Water Surface Fresnel
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(uLightPos - vWorldPosition);
        vec3 halfDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(normal, halfDir), 0.0), 32.0) * 1.5;
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0) * 0.40;

        // Combine foam, water color, specular, and caustics
        vec3 finalColor = mix(waterColor, uFoamColor, foamFactor * 0.90);
        finalColor += vec3(spec + fresnel * 0.4);

        // Crystal-clear transparency in water body so black letters on balls are 100% visible!
        float alpha = mix(0.18, 0.90, foamFactor);
        alpha = clamp(alpha + fresnel * 0.22, 0.15, 0.92);

        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

/**
 * 2. Optical Glass Door Shader with Droplets, Condensation, and Specular Refraction
 * Ultra-clear so that the water and balls inside pop with complete brilliance!
 * Includes mediump precision for full mobile/WebView compatibility.
 */
export function createGlassDoorMaterial(dropletTexture: THREE.Texture): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDropletsMap: { value: dropletTexture },
      uLedColor: { value: new THREE.Color('#f0f9ff') },
      uLedPos: { value: new THREE.Vector3(0.0, 1.9, 1.2) },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      precision mediump float;

      uniform float uTime;
      uniform sampler2D uDropletsMap;
      uniform vec3 uLedColor;
      uniform vec3 uLedPos;

      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;

      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        vec3 normal = normalize(vNormal);

        vec4 drop = texture2D(uDropletsMap, vUv);
        vec3 perturbedNormal = normalize(normal + vec3((drop.r - 0.5) * 0.18, (drop.g - 0.5) * 0.18, 0.0));

        float fresnel = pow(1.0 - max(dot(viewDir, perturbedNormal), 0.0), 3.0);
        vec3 lightDir = normalize(uLedPos - vWorldPosition);
        vec3 halfDir = normalize(lightDir + viewDir);
        float spec = pow(max(dot(perturbedNormal, halfDir), 0.0), 40.0) * 1.1;

        // Sleek dark-tinted smoked glass (obsidian / charcoal optical clarity)
        vec3 glassColor = mix(vec3(0.08, 0.10, 0.13), uLedColor, spec * 0.5);
        
        // Crisp optical clarity: water and yellow balls pop with incredible contrast!
        float alpha = clamp(0.02 + fresnel * 0.12 + drop.a * 0.10 + spec * 0.18, 0.01, 0.20);

        gl_FragColor = vec4(glassColor + vec3(spec * 0.6), alpha);
      }
    `,
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: false,
  });
}

