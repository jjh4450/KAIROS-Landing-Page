<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { Float } from '@threlte/extras';

	// 회전하는 추상 보안 마크 — Icosahedron(20면체) wireframe + 내부 작은 솔리드
	// useTask 로 매 프레임 부드럽게 회전 (Lenis 안 의존, GPU 친화)

	let rotation = $state({ x: 0, y: 0, z: 0 });

	useTask((delta) => {
		rotation.y += delta * 0.18;
		rotation.x += delta * 0.08;
	});
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={45} />

<!-- IBL 분위기 — 점광원 두 개 + ambient -->
<T.AmbientLight intensity={0.15} />
<T.DirectionalLight position={[6, 6, 6]} intensity={1.2} color="#7ad8ff" />
<T.DirectionalLight position={[-6, -3, -6]} intensity={0.8} color="#c79bff" />

<Float floatIntensity={1.2} rotationIntensity={0.4} speed={1.4}>
	<!-- 바깥 와이어프레임 -->
	<T.Mesh rotation.y={rotation.y} rotation.x={rotation.x}>
		<T.IcosahedronGeometry args={[1.6, 1]} />
		<T.MeshStandardMaterial
			color="#7ad8ff"
			wireframe
			transparent
			opacity={0.7}
			emissive="#7ad8ff"
			emissiveIntensity={0.3}
		/>
	</T.Mesh>

	<!-- 내부 솔리드 (PBR, 약한 반사) -->
	<T.Mesh rotation.y={-rotation.y * 0.6} rotation.z={rotation.z}>
		<T.IcosahedronGeometry args={[0.9, 0]} />
		<T.MeshPhysicalMaterial
			color="#1a0d2e"
			metalness={0.4}
			roughness={0.25}
			clearcoat={0.6}
			clearcoatRoughness={0.2}
			emissive="#5e2cab"
			emissiveIntensity={0.6}
		/>
	</T.Mesh>

	<!-- 작은 위성 -->
	<T.Mesh position={[1.8, 0.6, 0.5]} rotation.x={rotation.x * 2}>
		<T.OctahedronGeometry args={[0.18, 0]} />
		<T.MeshStandardMaterial
			color="#ff6fd0"
			emissive="#ff6fd0"
			emissiveIntensity={0.9}
			toneMapped={false}
		/>
	</T.Mesh>
</Float>
