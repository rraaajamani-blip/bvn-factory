import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

type Ball = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

const initialBalls: Ball[] = [
  { x: 70, y: 70, vx: 1.8, vy: 0, r: 16 },
  { x: 145, y: 35, vx: -1.2, vy: 1, r: 13 },
  { x: 220, y: 85, vx: 1, vy: -1.5, r: 18 },
];

export default function GameScreen() {
  const [balls, setBalls] = useState(initialBalls);
  const [gravity, setGravity] = useState(0.45);
  const [bounce, setBounce] = useState(0.78);
  const [wind, setWind] = useState(0);
  const [slow, setSlow] = useState(false);
  const [preset, setPreset] = useState('GRAVITY TEST');
  const last = useRef(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const dt = Math.min((now - last.current) / 16.67, 2);
      last.current = now;

      setBalls(prev =>
        prev.map(b => {
          let vx = b.vx + wind * 0.015 * dt;
          let vy = b.vy + gravity * dt;
          let x = b.x + vx * dt * (slow ? 0.35 : 1);
          let y = b.y + vy * dt * (slow ? 0.35 : 1);

          const floor = 255 - b.r;

          if (y > floor) {
            y = floor;
            vy = -Math.abs(vy) * bounce;
            vx *= 0.985;
          }

          if (x < b.r || x > width - 55 - b.r) {
            x = Math.max(b.r, Math.min(width - 55 - b.r, x));
            vx *= -bounce;
          }

          return { ...b, x, y, vx, vy };
        }),
      );
    }, 16);

    return () => clearInterval(timer);
  }, [gravity, bounce, wind, slow]);

  const reset = () => {
    setBalls(initialBalls);
    setGravity(0.45);
    setBounce(0.78);
    setWind(0);
    setSlow(false);
    setPreset('GRAVITY TEST');
  };

  const applyPreset = (name: string) => {
    setPreset(name);

    if (name === 'GRAVITY TEST') {
      setGravity(0.45);
      setBounce(0.78);
      setWind(0);
    }
    if (name === 'SUPER BOUNCE') {
      setGravity(0.45);
      setBounce(1.08);
      setWind(0);
    }
    if (name === 'WIND TUNNEL') {
      setGravity(0.35);
      setBounce(0.8);
      setWind(1.8);
    }
    if (name === 'MOON LAB') {
      setGravity(0.12);
      setBounce(0.9);
      setWind(0);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🧪 PHYSICS LAB</Text>
          <Text style={styles.subtitle}>LIVE EXPERIMENT • {preset}</Text>
        </View>
        <Pressable style={styles.resetSmall} onPress={reset}>
          <Text style={styles.resetText}>RESET</Text>
        </Pressable>
      </View>

      <View style={styles.arena}>
        <View style={styles.backGlow} />
        <View style={styles.platform} />
        <View style={styles.ramp} />
        <View style={styles.wall} />

        {balls.map((b, i) => (
          <View
            key={i}
            style={[
              styles.ball,
              {
                width: b.r * 2,
                height: b.r * 2,
                borderRadius: b.r,
                left: b.x,
                top: b.y,
              },
            ]}
          >
            <Text style={styles.ballMark}>{i + 1}</Text>
          </View>
        ))}

        <View style={styles.cubeOne} />
        <View style={styles.cubeTwo} />

        <View style={styles.hud}>
          <Text style={styles.hudText}>GRAVITY {gravity.toFixed(2)}</Text>
          <Text style={styles.hudText}>BOUNCE {bounce.toFixed(2)}</Text>
          <Text style={styles.hudText}>WIND {wind.toFixed(1)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>EXPERIMENT PRESETS</Text>

      <View style={styles.presets}>
        {['GRAVITY TEST', 'SUPER BOUNCE', 'WIND TUNNEL', 'MOON LAB'].map(p => (
          <Pressable
            key={p}
            onPress={() => applyPreset(p)}
            style={[styles.preset, preset === p && styles.presetActive]}
          >
            <Text style={styles.presetText}>{p}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>LAB CONTROLS</Text>

      <View style={styles.controls}>
        <Pressable style={styles.control} onPress={() => setGravity(0.45)}>
          <Text style={styles.icon}>🌍</Text>
          <Text style={styles.controlText}>GRAVITY</Text>
        </Pressable>

        <Pressable style={styles.control} onPress={() => setGravity(0.12)}>
          <Text style={styles.icon}>🌙</Text>
          <Text style={styles.controlText}>LOW-G</Text>
        </Pressable>

        <Pressable style={styles.control} onPress={() => setBounce(1.08)}>
          <Text style={styles.icon}>⚡</Text>
          <Text style={styles.controlText}>BOUNCE</Text>
        </Pressable>

        <Pressable style={styles.control} onPress={() => setWind(2)}>
          <Text style={styles.icon}>💨</Text>
          <Text style={styles.controlText}>WIND</Text>
        </Pressable>

        <Pressable style={styles.control} onPress={() => setWind(0)}>
          <Text style={styles.icon}>🔗</Text>
          <Text style={styles.controlText}>CHAIN</Text>
        </Pressable>

        <Pressable style={[styles.control, slow && styles.active]} onPress={() => setSlow(v => !v)}>
          <Text style={styles.icon}>🐢</Text>
          <Text style={styles.controlText}>SLOW</Text>
        </Pressable>
      </View>

      <Pressable style={styles.resetLab} onPress={reset}>
        <Text style={styles.resetLabText}>🔄 RESET LAB</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#070b10', padding: 14 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: { color: '#fff', fontSize: 21, fontWeight: '800' },
  subtitle: { color: '#6ee7b7', fontSize: 10, marginTop: 3 },
  resetSmall: { padding: 9, borderRadius: 8, backgroundColor: '#202a33' },
  resetText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  arena: {
    height: 285,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#111923',
    borderWidth: 1,
    borderColor: '#314252',
    position: 'relative',
  },
  backGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#173b35',
    opacity: 0.5,
    top: 25,
    left: width / 2 - 90,
  },
  platform: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 15,
    height: 24,
    backgroundColor: '#344454',
    borderRadius: 5,
  },
  ramp: {
    position: 'absolute',
    right: 20,
    bottom: 39,
    width: 100,
    height: 18,
    backgroundColor: '#536779',
    transform: [{ rotate: '-18deg' }],
  },
  wall: {
    position: 'absolute',
    left: 20,
    top: 115,
    width: 18,
    height: 100,
    backgroundColor: '#46596a',
    borderRadius: 4,
  },
  ball: {
    position: 'absolute',
    backgroundColor: '#fbbf24',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ballMark: { color: '#111', fontSize: 9, fontWeight: '900' },
  cubeOne: {
    position: 'absolute',
    right: 75,
    bottom: 39,
    width: 38,
    height: 38,
    backgroundColor: '#60a5fa',
    transform: [{ rotate: '12deg' }],
    borderRadius: 5,
  },
  cubeTwo: {
    position: 'absolute',
    left: 75,
    bottom: 39,
    width: 32,
    height: 32,
    backgroundColor: '#a78bfa',
    transform: [{ rotate: '-8deg' }],
    borderRadius: 5,
  },
  hud: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
    backgroundColor: '#0009',
    borderRadius: 8,
  },
  hudText: { color: '#fff', fontSize: 9, marginBottom: 2 },
  sectionTitle: {
    color: '#a7f3d0',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 7,
  },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  preset: {
    backgroundColor: '#17212b',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 9,
    borderWidth: 1,
    borderColor: '#2c3b49',
  },
  presetActive: { borderColor: '#6ee7b7', backgroundColor: '#18362f' },
  presetText: { color: '#d7e2ea', fontSize: 9, fontWeight: '700' },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  control: {
    width: '31%',
    minHeight: 55,
    backgroundColor: '#151f29',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#293847',
  },
  active: { borderColor: '#fbbf24' },
  icon: { fontSize: 17 },
  controlText: { color: '#d7e2ea', fontSize: 8, fontWeight: '800', marginTop: 2 },
  resetLab: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#263442',
    alignItems: 'center',
  },
  resetLabText: { color: '#fff', fontWeight: '800', fontSize: 11 },
});
