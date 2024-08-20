import React, { useEffect, useRef } from 'react';
import './TubeRotation.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MainPage from '../MainPage';

gsap.registerPlugin(ScrollTrigger);

const TubeRotation: React.FC = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const tubeInnerRef = useRef<HTMLDivElement>(null);
  const additionalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage  = stageRef.current;
    const tubeInner: any = tubeInnerRef.current;
    const additional: any = additionalRef.current;

    if (!stage || !tubeInner || !additional) return;

    const clone = tubeInner.getElementsByClassName("line") as HTMLCollectionOf<HTMLDivElement>;
    const numLines = 10;
    const fontSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--fontSize'));
    const angle = 360 / numLines;
    let radius = 0;
    let origin = '';

    function set3D() {
      const width = window.innerWidth;
      const fontSizePx = (width / 100) * fontSize;
      radius = (fontSizePx / 2) / Math.sin((180 / numLines) * (Math.PI / 180));
      origin = `50% 50% -${radius}px`;
    }

    function cloneNode() {
      for (let i = 0; i < (numLines - 1); i++) {
        const newClone = clone[0].cloneNode(true) as HTMLDivElement;
        const lineClass = `line--${i + 2}`;
        newClone.classList.add(lineClass);
        tubeInner.appendChild(newClone);
      }

      (clone[0] as HTMLDivElement).classList.add("line--1");
    }

    function positionTxt() {
      gsap.set('.line', {
        rotationX: (index: number) => -angle * index,
        z: radius,
        transformOrigin: origin,
      });
    }

    function setProps(targets: Element[]) {
      targets.forEach(target => {
        const paramSet = gsap.quickSetter(target, "css");
        const degrees = gsap.getProperty(target, "rotateX") as number;
        const radians = degrees * (Math.PI / 180);
        const conversion = Math.abs(Math.cos(radians) / 2 + 0.5);
        const fontW = 200 + 700 * conversion;
        const fontS = `${100 + 700 * conversion}%`;

        paramSet({
          opacity: conversion + 0.05,
          fontWeight: fontW,
          fontStretch: fontS
        });
      });
    }

    function scrollRotate() {
      gsap.to('.line', {
        scrollTrigger: {
          trigger: '.stage',
          scrub: 1,
          start: "top top",
          end: "bottom top",
          // markers: true
        },
        rotateX: "+=130",
        onUpdate: function () {
          setProps(this.targets());
        },
        onComplete: function() {
          ScrollTrigger.getAll().forEach(trigger => trigger.kill());
          if (stage && stage.parentElement) {
            gsap.set(stage, {
              opacity: 0,
            });
            stage.parentElement.removeChild(stage);
          }
          gsap.set(additional, {
            opacity: 1,
            transform: 'scale(1)'
          });
          gsap.set(additional.parentElement, {
            height: 'auto',
            minHeight: '100vh',
          });
        }
      });

      gsap.to('.tube', {
        scrollTrigger: {
          trigger: '.stage',
          scrub: 1,
          start: "top top",
          end: "bottom top",
          // markers: true
        },
        perspective: '1vw',
        ease: 'expo.out',
        opacity: 0,
        onComplete: function() {
          ScrollTrigger.getAll().forEach(trigger => trigger.kill());
          if (stage && stage.parentElement) {
            gsap.set(stage, {
              opacity: 0,
            });
            stage.parentElement.removeChild(stage);
          }
          gsap.set(additional, {
            opacity: 1,
            transform: 'scale(1)'
          });
          gsap.set(additional.parentElement, {
            height: 'auto',
            minHeight: '100vh',
          });
        }
      });

      gsap.to(additional, {
        opacity: 1,
        scrollTrigger: {
          trigger: '.stage',
          start: "top top", // Когда верхняя часть .stage достигнет верхней части окна
          end: "bottom bottom",
          scrub: 1,
          // markers: true
        },
        transform: "scale(1)",
        ease: 'expo.in',
        onComplete: function() {
          ScrollTrigger.getAll().forEach(trigger => trigger.kill());
          if (stage && stage.parentElement) {
            gsap.set(stage, {
              opacity: 0,
            });
            stage.parentElement.removeChild(stage);
          }
          gsap.set(additional, {
            opacity: 1,
            transform: 'scale(1)'
          });
          gsap.set(additional.parentElement, {
            height: 'auto',
            minHeight: '100vh',
          });
        }
      });
    }

    function init() {
      cloneNode();
      set3D();
      window.onresize = () => {
        set3D();
        positionTxt();
      };
      positionTxt();
      setProps(gsap.utils.toArray(".line"));
      scrollRotate();
      gsap.to(stage, { autoAlpha: 1, duration: 2, delay: 2 });
    }

    init();

  }, []);

  return (
    <div className='wrap'>
      <div className="stage" ref={stageRef}>
        <div className="tube">
          <div className="tube__inner" ref={tubeInnerRef}>
            <h1 className="line">Rotation</h1>
          </div>
        </div>
      </div>
      <div className="additional" ref={additionalRef}>
        <MainPage/>
      </div>
    </div>
  );
};

export default TubeRotation;
