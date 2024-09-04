import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { DirectionalLight, Group, MeshStandardMaterial, Mesh, Color, PointLight, AnimationMixer,LoopRepeat } from 'three';
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
  const radius = 20; // Радиус круга
  const radiusE = 4; // Радиус круга
  const [angle, setAngle] = useState((1.25)*Math.PI); // Угол в радианах
  const [angleEarth, setAngleEarth] = useState(Math.PI/2); // Угол в радианах
  
  // Load the GLTF model
  
  const scale = 2;
  const scaleE = 2;
  const scaleskybox = 10;
  const model = useLoader(GLTFLoader, '/stroming_sun.glb');
  const earth = useLoader(GLTFLoader, '/earth.glb');
  const skybox = useLoader(GLTFLoader, '/skybox.glb');
  const modelRef = useRef<Group>(null);
  const earthRef = useRef<Group>(null);
  const skyboxRef = useRef<Group>(null);
  const lightRef = useRef<DirectionalLight>(null);
  const pointLightRef = useRef<PointLight>(null);
  const { animations } = model;

  model.scene.traverse((child:any) => {
    if ((child as Mesh).isMesh) {
      const mesh = child as Mesh;
      const material = mesh.material as MeshStandardMaterial;

      // Ensure the material is a standard material
      if (material.isMeshStandardMaterial) {
        material.emissive = new Color(0xffffd0); // Yellow emissive color
        material.emissiveIntensity = 3*lightIntensity;
      }
    }
  });


  const mixer = useMemo(() => new AnimationMixer(model.scene), [model.scene]);

  useEffect(() => {
    if (animations && animations.length > 0) {
      // Останавливаем предыдущие действия перед запуском новых
      mixer.stopAllAction();

      animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.setLoop(LoopRepeat, Number.MAX_SAFE_INTEGER); // Зацикливание анимации "туда и обратно"
        action.fadeIn(1); // Плавное появление анимации
        action.clampWhenFinished = true; // Оставляет анимацию на последнем кадре при остановке
        action.timeScale = 1; // Устанавливаем скорость анимации
        action.play(); // Воспроизводим анимацию
      });
    }

    // Возвращаем функцию очистки для остановки микшера при размонтировании
    return () => {
      mixer.stopAllAction();
    };
  }, [animations, mixer]);


  // Анимация изменения интенсивности света
  useFrame((_, del) => {
    mixer.update(del);

    if (lightIntensity < 1) {
      setLightIntensity((prev) => Math.min(prev + 0.005, 20));
    }

    const delta = 10; // Angle change speed

    const newAngleEarth = angleEarth + (delta/10000)*Math.PI; // Calculate the new angle
    const newAngle = angle + (delta/10000/3)*Math.PI; // Calculate the new angle

    // Calculate the new positions based on the updated angle
    const x = radius * Math.cos(newAngle);
    const z = radius * Math.sin(newAngle);
    
    setAngle(newAngle);

    // Update the position and angle state
    const xE = radiusE * Math.cos(newAngleEarth);
    const yE = radiusE * Math.sin(newAngleEarth);
    const zE = radiusE * Math.sin(newAngleEarth);
    
    setAngleEarth(newAngleEarth);
    // Update the positions directly via refs
    if (modelRef.current) {
      modelRef.current.position.set(x, -2, z);
      modelRef.current.scale.set(scale,scale,scale);
    }
    if (earthRef.current) {
      earthRef.current.position.set(xE, yE, zE);
      earthRef.current.scale.set(scaleE,scaleE,scaleE);
      // let [rotX, rotY, rotZ] = earthRef.current.rotation;
      // rotZ = 0;
      // rotY = (rotY as number) + 0.001;
      // rotX = 1;
      earthRef.current.rotation.x = Math.cos(newAngleEarth);
      earthRef.current.rotation.z = Math.sin(newAngleEarth) + 0.001;
      earthRef.current.rotation.y = Math.sin(newAngleEarth);
    }
    if (skyboxRef.current) {
      // skyboxRef.current.visible = (lightIntensity < 1) ? false: true;
      skyboxRef.current.rotation.set(Math.cos(newAngleEarth),Math.sin(newAngleEarth), Math.sin(newAngleEarth));
      skyboxRef.current.scale.set(scaleskybox,scaleskybox,scaleskybox);

      skyboxRef.current.traverse((child: any) => {
        if (child.isMesh) {
          child.material.transparent = true; // Включаем поддержку прозрачности
          child.material.opacity = lightIntensity*0.1; // Устанавливаем нужный уровень прозрачности (0.0 - полностью прозрачный, 1.0 - полностью непрозрачный)
        }
      });
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
      <ambientLight intensity={lightIntensity * 0.06} />
      <directionalLight ref={lightRef} intensity={lightIntensity * 2} color={0xffffcd}/>
      <pointLight 
        ref={pointLightRef} 
        intensity={lightIntensity} // Adjust as needed
        distance={10000} 
        decay={0.1} 
        color={0xffffcd} 
      />
      <primitive object={model.scene} ref={modelRef} />
      <primitive object={skybox.scene} ref={skyboxRef} />
      <primitive object={earth.scene} ref={earthRef} />
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