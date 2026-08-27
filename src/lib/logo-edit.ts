export type Rgba = [number, number, number, number];

export function colorDist(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function idx(x: number, y: number, w: number) {
  return (y * w + x) * 4;
}

function sampleBlock(data: Uint8ClampedArray, w: number, h: number, cx: number, cy: number, radius = 2): Rgba {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let y = Math.max(0, cy - radius); y <= Math.min(h - 1, cy + radius); y += 1) {
    for (let x = Math.max(0, cx - radius); x <= Math.min(w - 1, cx + radius); x += 1) {
      const i = idx(x, y, w);
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n += 1;
    }
  }
  return n ? [Math.round(r / n), Math.round(g / n), Math.round(b / n), 255] : [255, 255, 255, 255];
}

export function detectBackgroundColor(data: Uint8ClampedArray, w: number, h: number): Rgba {
  const samples = [
    sampleBlock(data, w, h, 1, 1),
    sampleBlock(data, w, h, w - 2, 1),
    sampleBlock(data, w, h, 1, h - 2),
    sampleBlock(data, w, h, w - 2, h - 2),
  ];
  const mid = samples.sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]))[1];
  return mid;
}

function floodFromSeeds(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  seeds: Array<[number, number]>,
  target: Rgba,
  tolerance: number
) {
  const seen = new Uint8Array(w * h);
  const qx = new Int32Array(w * h);
  const qy = new Int32Array(w * h);
  let qs = 0;
  let qe = 0;

  const push = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (seen[p]) return;
    const i = p * 4;
    if (data[i + 3] === 0) {
      seen[p] = 1;
      return;
    }
    if (colorDist(data[i], data[i + 1], data[i + 2], target[0], target[1], target[2]) > tolerance) return;
    seen[p] = 1;
    qx[qe] = x;
    qy[qe] = y;
    qe += 1;
  };

  for (const [x, y] of seeds) push(x, y);

  while (qs < qe) {
    const x = qx[qs];
    const y = qy[qs];
    qs += 1;
    const i = idx(x, y, w);
    data[i + 3] = 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
}

export function removeBackgroundFromEdges(
  image: ImageData,
  target: Rgba,
  tolerance: number
): ImageData {
  const { width: w, height: h, data } = image;
  const next = new ImageData(new Uint8ClampedArray(data), w, h);
  const seeds: Array<[number, number]> = [];
  for (let x = 0; x < w; x += 1) {
    seeds.push([x, 0], [x, h - 1]);
  }
  for (let y = 0; y < h; y += 1) {
    seeds.push([0, y], [w - 1, y]);
  }
  floodFromSeeds(next.data, w, h, seeds, target, tolerance);
  return next;
}

export function autoRemoveBackground(image: ImageData, tolerance: number): ImageData {
  const bg = detectBackgroundColor(image.data, image.width, image.height);
  return removeBackgroundFromEdges(image, bg, tolerance);
}

export function magicWandErase(
  image: ImageData,
  x: number,
  y: number,
  tolerance: number
): ImageData {
  const { width: w, height: h, data } = image;
  if (x < 0 || y < 0 || x >= w || y >= h) return image;
  const i = idx(x, y, w);
  if (data[i + 3] === 0) return image;
  const target: Rgba = [data[i], data[i + 1], data[i + 2], data[i + 3]];
  const next = new ImageData(new Uint8ClampedArray(data), w, h);
  floodFromSeeds(next.data, w, h, [[x, y]], target, tolerance);
  return next;
}

export function brushStamp(
  current: ImageData,
  original: ImageData,
  cx: number,
  cy: number,
  radius: number,
  restore: boolean
): ImageData {
  const { width: w, height: h } = current;
  const next = new ImageData(new Uint8ClampedArray(current.data), w, h);
  const r2 = radius * radius;
  const x0 = Math.max(0, Math.floor(cx - radius));
  const x1 = Math.min(w - 1, Math.ceil(cx + radius));
  const y0 = Math.max(0, Math.floor(cy - radius));
  const y1 = Math.min(h - 1, Math.ceil(cy + radius));
  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 > r2) continue;
      const i = idx(x, y, w);
      const edge = Math.sqrt(d2) / radius;
      const strength = 1 - edge * edge;
      if (restore) {
        next.data[i] = original.data[i];
        next.data[i + 1] = original.data[i + 1];
        next.data[i + 2] = original.data[i + 2];
        next.data[i + 3] = Math.max(
          next.data[i + 3],
          Math.round(original.data[i + 3] * strength)
        );
      } else {
        next.data[i + 3] = Math.round(next.data[i + 3] * (1 - strength));
      }
    }
  }
  return next;
}

export function featherAlpha(image: ImageData, radius: number): ImageData {
  if (radius <= 0) return image;
  const { width: w, height: h, data } = image;
  const src = new Uint8ClampedArray(data);
  const next = new ImageData(new Uint8ClampedArray(data), w, h);
  const r = Math.max(1, Math.round(radius));
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      let sum = 0;
      let n = 0;
      for (let dy = -r; dy <= r; dy += 1) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -r; dx <= r; dx += 1) {
          const xx = x + dx;
          if (xx < 0 || xx >= w) continue;
          sum += src[idx(xx, yy, w) + 3];
          n += 1;
        }
      }
      next.data[idx(x, y, w) + 3] = Math.round(sum / n);
    }
  }
  return next;
}

export function defringe(image: ImageData, bg: Rgba, amount = 28): ImageData {
  const { width: w, height: h, data } = image;
  const next = new ImageData(new Uint8ClampedArray(data), w, h);
  for (let i = 0; i < next.data.length; i += 4) {
    const a = next.data[i + 3];
    if (a === 0 || a === 255) continue;
    const dist = colorDist(next.data[i], next.data[i + 1], next.data[i + 2], bg[0], bg[1], bg[2]);
    if (dist < amount + (255 - a) * 0.4) {
      next.data[i + 3] = Math.max(0, a - Math.round((amount - dist) * 2));
    }
  }
  return next;
}

export function opaqueBounds(image: ImageData, alphaMin = 18) {
  const { width: w, height: h, data } = image;
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (data[idx(x, y, w) + 3] < alphaMin) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return { x: 0, y: 0, w, h };
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

export function cropImageData(
  image: ImageData,
  box: { x: number; y: number; w: number; h: number }
): ImageData {
  const next = new ImageData(Math.max(1, box.w), Math.max(1, box.h));
  for (let y = 0; y < next.height; y += 1) {
    for (let x = 0; x < next.width; x += 1) {
      const sx = box.x + x;
      const sy = box.y + y;
      if (sx < 0 || sy < 0 || sx >= image.width || sy >= image.height) continue;
      const from = idx(sx, sy, image.width);
      const to = idx(x, y, next.width);
      next.data[to] = image.data[from];
      next.data[to + 1] = image.data[from + 1];
      next.data[to + 2] = image.data[from + 2];
      next.data[to + 3] = image.data[from + 3];
    }
  }
  return next;
}

/** Crop the crest and sit it upright in a square, ready for the gold frame. */
export function straightenLogo(image: ImageData, size = 512, pad = 0.1): ImageData {
  const bg = detectBackgroundColor(image.data, image.width, image.height);
  let next = autoRemoveBackground(image, 42);
  next = defringe(next, bg);
  next = featherAlpha(next, 1);
  const box = opaqueBounds(next);
  const cropped = cropImageData(next, box);
  const canvas = new ImageData(size, size);
  const inner = size * (1 - pad * 2);
  const scale = Math.min(inner / cropped.width, inner / cropped.height);
  const dw = Math.max(1, Math.round(cropped.width * scale));
  const dh = Math.max(1, Math.round(cropped.height * scale));
  const ox = Math.round((size - dw) / 2);
  const oy = Math.round((size - dh) / 2);
  for (let y = 0; y < dh; y += 1) {
    const sy = Math.min(cropped.height - 1, Math.floor(y / scale));
    for (let x = 0; x < dw; x += 1) {
      const sx = Math.min(cropped.width - 1, Math.floor(x / scale));
      const from = idx(sx, sy, cropped.width);
      const to = idx(ox + x, oy + y, size);
      canvas.data[to] = cropped.data[from];
      canvas.data[to + 1] = cropped.data[from + 1];
      canvas.data[to + 2] = cropped.data[from + 2];
      canvas.data[to + 3] = cropped.data[from + 3];
    }
  }
  return canvas;
}
