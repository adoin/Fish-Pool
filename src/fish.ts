const TAU = Math.PI * 2;

export interface FishState {
  x: number;
  y: number;
  angle: number;
  length: number;
  cruise: number;
  speed: number;
  phase: number;
  seed: number;
  kind: number;
  fear: number;
  turn: number;
  wakeClock: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface FishUpdateContext {
  width: number;
  height: number;
  time: number;
  dt: number;
  fish: FishState[];
  onWake: (x: number, y: number, radius: number, strength: number) => void;
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function createFish(count: number, seed: number): FishState[] {
  const random = mulberry32(seed);
  const fish: FishState[] = [];

  for (let index = 0; index < count; index += 1) {
    const length = 108 + random() * 42;
    fish.push({
      x: 0.18 + random() * 0.64,
      y: 0.16 + random() * 0.68,
      angle: random() * TAU,
      length,
      cruise: (28 + random() * 18) / 700,
      speed: (28 + random() * 18) / 700,
      phase: random() * TAU,
      seed: random(),
      kind: index % 4,
      fear: 0,
      turn: (random() - 0.5) * 0.4,
      wakeClock: random() * 0.2,
    });
  }

  return fish;
}

function wrapAngle(value: number): number {
  return Math.atan2(Math.sin(value), Math.cos(value));
}

function steerToward(current: number, desired: number, amount: number): number {
  return current + wrapAngle(desired - current) * amount;
}

export function updateFish(context: FishUpdateContext): void {
  const { fish, width, height, time, dt, onWake } = context;
  const aspect = width / Math.max(height, 1);

  for (let index = 0; index < fish.length; index += 1) {
    const item = fish[index];
    if (!item) continue;

    const noise =
      Math.sin(time * 0.31 + item.seed * 17.1) * 0.55 +
      Math.sin(time * 0.13 + item.seed * 43.7) * 0.35;
    item.turn += noise * dt * 0.22;
    item.turn *= Math.pow(0.7, dt);

    let desired = item.angle + item.turn * dt;
    const marginX = 0.14;
    const marginY = 0.17;
    const edgeX = item.x < marginX || item.x > 1 - marginX;
    const edgeY = item.y < marginY || item.y > 1 - marginY;
    if (edgeX || edgeY) {
      const centerAngle = Math.atan2(0.5 - item.y, (0.5 - item.x) * aspect);
      desired = steerToward(desired, centerAngle, Math.min(1, dt * 2.4));
    }

    for (let otherIndex = 0; otherIndex < fish.length; otherIndex += 1) {
      if (otherIndex === index) continue;
      const other = fish[otherIndex];
      if (!other) continue;
      const dx = (item.x - other.x) * aspect;
      const dy = item.y - other.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 0 && distance < 0.12) {
        desired = steerToward(desired, Math.atan2(dy, dx), dt * (0.12 - distance) * 8);
      }
    }

    item.angle = wrapAngle(steerToward(item.angle, desired, Math.min(1, dt * 2.2)));
    item.fear = Math.max(0, item.fear - dt * 0.42);
    const targetSpeed = item.cruise * (1 + item.fear * 2.8);
    item.speed += (targetSpeed - item.speed) * Math.min(1, dt * (item.fear > 0 ? 4.5 : 1.2));

    const tailPulse = 1 + Math.sin(time * (2.2 + item.speed * 13) + item.phase) * 0.06;
    item.x += (Math.cos(item.angle) * item.speed * tailPulse * dt) / aspect;
    item.y += Math.sin(item.angle) * item.speed * tailPulse * dt;

    item.x = Math.min(0.98, Math.max(0.02, item.x));
    item.y = Math.min(0.98, Math.max(0.02, item.y));

    item.wakeClock -= dt;
    if (item.wakeClock <= 0) {
      const lengthInHeight = item.length / Math.max(height, 1);
      const tailX = item.x - (Math.cos(item.angle) * lengthInHeight * 0.42) / aspect;
      const tailY = item.y - Math.sin(item.angle) * lengthInHeight * 0.42;
      onWake(tailX, tailY, Math.max(10, item.length * 0.13), 0.025 + item.fear * 0.09);
      item.wakeClock = item.fear > 0 ? 0.04 : 0.11;
    }
  }
}

export function hitTestFish(
  fish: FishState[],
  point: Point,
  width: number,
  height: number,
): FishState | null {
  for (let index = fish.length - 1; index >= 0; index -= 1) {
    const item = fish[index];
    if (!item) continue;
    const dx = point.x - item.x * width;
    const dy = height - point.y - item.y * height;
    const cosine = Math.cos(item.angle);
    const sine = Math.sin(item.angle);
    const localX = dx * cosine + dy * sine;
    const localY = -dx * sine + dy * cosine;
    const body = (localX / (item.length * 0.56)) ** 2 + (localY / (item.length * 0.22)) ** 2;
    if (body <= 1.25) return item;
  }
  return null;
}

export function scareFish(fish: FishState, point: Point, width: number, height: number): void {
  const fishX = fish.x * width;
  const fishY = height - fish.y * height;
  fish.angle = Math.atan2(fishY - point.y, fishX - point.x);
  fish.fear = 1;
  fish.speed = Math.max(fish.speed, fish.cruise * 2.2);
}
