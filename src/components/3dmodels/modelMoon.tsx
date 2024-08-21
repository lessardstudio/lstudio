import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { DirectionalLight, Group, MeshStandardMaterial, Mesh, Color, PointLight } from 'three';
import { useGLTF } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import Model from './model';



type GLTFModelProps = {
  path?: string;
  position?: [number, number, number];
  scale?: number | [number, number, number];
};

const GLTFModel = forwardRef(({ path = '/the_moon.glb', position = [0, 0, 0], scale = 1}: GLTFModelProps, ref) => {
  const [model] = useState(new Model(path, position as [number, number, number], [0, 0, 0]));
  const { scene } = useGLTF(model.getPath());
  const localRef = useRef<any>(null);


  useImperativeHandle(ref, () => ({
    switchHover: (hover: boolean) => {
      console.log(`switchHover called with: ${hover}`); // Add logging
      model.switchHover(hover);
    }
  }));

  

  useFrame(() => {
    if (localRef.current) {
      hoverAnimation();
      localRef.current.position.set(...model.getPosition());
      let [rotX, rotY, rotZ] = model.getRotation();
      rotZ = 0;
      rotY += 0.001;
      rotX = -0.5;
      model.setRotation([rotX, rotY, rotZ]);
      localRef.current.rotation.set(...model.getRotation());
    }
  });

  const hoverAnimation = () => {
    // const [posX, posY] = model.getPosition();
    // const [rotX, rotY, rotZ] = model.getRotation();

    // if (model.getHover() && posX <= 0) {
    //   const newPosX = posX + (0 - posX) / 3;
    //   model.setPosition([newPosX, posY, newPosX]);
    //   const newRotY = rotY + (0.5 - rotY) / 10;
    //   model.setRotation([rotX, newRotY, rotZ]);
    // } else if (!model.getHover() && posX >= -0.5) {
    //   const newPosX = posX - (posX + 0.5) / 3;
    //   model.setPosition([newPosX, posY, newPosX]);
    //   const newRotY = rotY - (0.11 + rotY) / 10;
    //   model.setRotation([rotX, newRotY, rotZ]);
    // }
  };

  return (
    <primitive
      ref={localRef}
      object={scene}
      position={model.getPosition()}
      rotation={model.getRotation()}
      scale={scale}
    />
  );
});

const ModelWithAnimation: React.FC = () => {
  const [lightIntensity, setLightIntensity] = useState(0);
  const radius = 25; // Радиус круга
  const [angle, setAngle] = useState(1/2); // Угол в радианах
  
  // Load the GLTF model
  
  const scale = 1.8;
  const model = useLoader(GLTFLoader, '/sun.glb');
  const modelRef = useRef<Group>(null);
  const lightRef = useRef<DirectionalLight>(null);
  const pointLightRef = useRef<PointLight>(null);

  model.scene.traverse((child:any) => {
    if ((child as Mesh).isMesh) {
      const mesh = child as Mesh;
      const material = mesh.material as MeshStandardMaterial;

      // Ensure the material is a standard material
      if (material.isMeshStandardMaterial) {
        material.emissive = new Color(0xfffffd); // Yellow emissive color
        material.emissiveIntensity = 3;
      }
    }
  });


  // Анимация изменения интенсивности света
  useFrame(() => {
    if (lightIntensity < 1) {
      setLightIntensity((prev) => Math.min(prev + 0.0005, 50));
    }

    const delta = 0.01; // Angle change speed
    const newAngle = angle + delta; // Calculate the new angle

    // Calculate the new positions based on the updated angle
    const x = radius * Math.cos(newAngle);
    const z = radius * Math.sin(newAngle);

    // Update the position and angle state
    setAngle(newAngle);
    // Update the positions directly via refs
    if (modelRef.current) {
      modelRef.current.position.set(x, -2, z);
      modelRef.current.scale.set(scale,scale,scale);
    }

    if (lightRef.current) {
      lightRef.current.position.set(x, -2, z);
    }

    if (pointLightRef.current) {
      pointLightRef.current.position.set(x, -2, z);
      pointLightRef.current.intensity = lightIntensity;
    }



  });

  return (
    <>
      <ambientLight intensity={lightIntensity * 0.03} />
      <directionalLight ref={lightRef} intensity={lightIntensity * 4} color={0xffffcd}/>
      <pointLight 
        ref={pointLightRef} 
        intensity={lightIntensity} // Adjust as needed
        distance={1000} 
        decay={0.01} 
        color={0xffffcd} 
      />
      <primitive object={model.scene} ref={modelRef} />
      <EffectComposer>
        <Bloom intensity={1.5} radius={0.6} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
      </EffectComposer>
    </>
  );
};


const ModelComponent: React.FC = forwardRef((_props, ref) => {
  return (
    <div>
      <Canvas style={{ height: '100vh', width: '100vw'}}
        camera={{rotation: [0,0,0.6], position: [0, 0, 2], fov: 75, near: 0.9, far: 1000 }}>
        <ModelWithAnimation/>
        <GLTFModel ref={ref} position={[0, 0, 0]} />
      </Canvas>
    </div>
  );
});





export default ModelComponent;