import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import Model from './model';



type GLTFModelProps = {
  path?: string;
  position?: [number, number, number];
};

const GLTFModel = forwardRef(({ path = '/the_moon.glb', position = [0, 0, 0] }: GLTFModelProps, ref) => {
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
    />
  );
});

const ModelWithAnimation: React.FC = () => {
  const [lightIntensity, setLightIntensity] = useState(0);
  const radius = 25; // Радиус круга
  const [angle, setAngle] = useState(1/6); // Угол в радианах
  const [xAnimatePos, setxAnimatePos] = useState(radius * Math.cos(angle));
  const [zAnimatePos, setzAnimatePos] = useState(radius * Math.sin(angle));


  // Анимация изменения интенсивности света
  useFrame(() => {
    if (lightIntensity < 1) {
      setLightIntensity(prev => Math.min(prev + 0.005, 1));
    }

    const delta = 0.001; // Скорость изменения угла
    setAngle(prev => prev + delta); // Увеличиваем угол

    const x = radius * Math.cos(angle); // Вычисляем x по окружности
    const z = radius * Math.sin(angle); // Вычисляем z по окружности
    setxAnimatePos(x);
    setzAnimatePos(z);

  });

  return (
    <>
      <ambientLight intensity={lightIntensity * 0.01} />
      <directionalLight position={[xAnimatePos, 10, zAnimatePos]} intensity={lightIntensity*1} />
    </>
  );
};


const ModelComponent: React.FC = forwardRef((_props, ref) => {
  return (
    <div>
      <Canvas style={{ height: '100vh', width: '100vw' }}
        camera={{rotation: [0,0,0.4], position: [0, 0, 2], fov: 70, near: 0.9, far: 1000 }}>
        <ModelWithAnimation/>
        <GLTFModel ref={ref} position={[0, 0, 0]} />
      </Canvas>
    </div>
  );
});





export default ModelComponent;