import { animated, useSpring } from '@react-spring/three';
import type { Vector3 } from '@react-three/fiber';
import { Canvas } from '@react-three/fiber';
import React from 'react';
import type * as THREE from 'three';
import type { IAnswered } from '@/types';
import type { Tables } from '@/types/supabase.types';

const AnswerPanel = ({
  size,
}: {
  flip: boolean;
  size: number[];
  position?: Vector3;
  answer: string;
  points: number;
}) => {
  const mesh = React.useRef<THREE.Mesh>(null!);
  const [rot, setRot] = React.useState(0);
  const springs = useSpring({
    rotation: [rot, 0, 0],
    config: {
      mass: 1.8,
      friction: 15,
      tension: 290,
    },
  });

  return (
    <animated.mesh
      {...springs}
      ref={mesh}
      onClick={() => setRot(rot + Math.PI / 2)}
    >
      position={[0, 0, 0]}
      <boxGeometry args={[size[0], size[1], size[2]]} />
      <meshStandardMaterial />
    </animated.mesh>
  );
};

const Gameboard = ({
  answers,
}: {
  answers: Tables<'answers'>[];
  answered: IAnswered;
}): React.ReactElement => {
  if (!answers) {
    // answers = [{ id: '1', answer: 'Answer1', score: 0 }];
  }

  return (
    <Canvas style={{ height: '100%', width: '100%' }}>
      <ambientLight intensity={0.4} />
      <directionalLight color="red" position={[0, 0, 10]} />
      {/* <mesh> */}
      {/*   <boxGeometry /> */}
      {/*   <meshStandardMaterial /> */}
      {/* </mesh> */}
      <AnswerPanel
        size={[6, 2, 2]}
        flip={false}
        position={[-3.5, 2.9, 0]}
        answer="The Answer"
        points={50}
      />
      {/* <AnswerPanel */}
      {/*   size={[3, 1, 1]} */}
      {/*   flip={false} */}
      {/*   position={[-3.5, -2.0, 0]} */}
      {/*   answer="The Answer" */}
      {/*   points={50} */}
      {/* /> */}
    </Canvas>
  );
};

export default Gameboard;
