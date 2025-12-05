---

# **📄 TECHNICAL REPORT — How to Properly Export an HTML Canvas With Smooth Gradients (No Hard Lines / Banding)**

## **1. Problem Summary**

Gradients exported from an HTML `<canvas>` often show **banding** (visible color steps / hard lines).
This happens due to:

* 8-bit channel precision (0–255 values create visible steps)
* low DPI canvas resolution
* compression artifacts (JPEG especially)
* color quantization when exporting
* GPU/CPU interpolation precision differences

To eliminate banding, the gradient must be **oversampled**, **dithered**, and **exported losslessly**.

---

# **2. Best Method: High-Resolution Canvas Export + Dithering**

## **2.1 Required Principles**

1. **Draw and export at higher resolution than display resolution.**

   * E.g. if the canvas is 1200×600, render/export at 2400×1200 or 3600×1800.
2. **Use lossless format (PNG or WebP lossless).**
3. **Apply subtle dithering (random noise or error diffusion) to break up banding.**
4. **Optionally use WebGL or OffscreenCanvas for higher precision gradient math.**

---

# **3. Implementation Tasks for Cursor Agent**

Below are explicit items your agent can perform.

---

# **3.1 Implement Hi-Res Gradient Renderer with Export**

### **Create a helper utility: `exportHighResCanvas.js`**

It should:

### **Step 1 — Create a high-resolution canvas**

* Multiply original width/height by `scale` (2–4 recommended).
* Use `devicePixelRatio` as minimum scale.

```js
const scale = opts.scale || window.devicePixelRatio || 2;
tempCanvas.width  = width  * scale;
tempCanvas.height = height * scale;
ctx.scale(scale, scale);
```

---

### **Step 2 — Render the gradient at the scaled resolution**

Your draw function gets called once the scaled canvas is ready:

```js
await drawFn(ctx, width, height);
```

---

### **Step 3 — Apply dithering (very important)**

Provide two modes:

### **A. Fast Random Noise Dithering**

(cheap, effective)

```js
for (let i = 0; i < data.length; i += 4) {
  const d = (Math.random() - 0.5) * noise;
  data[i]   = clamp(data[i]   + d);
  data[i+1] = clamp(data[i+1] + d);
  data[i+2] = clamp(data[i+2] + d);
}
```

### **B. Floyd–Steinberg Dithering**

(slower but highest quality)

```js
// implement FS diffusion coefficients:
//    * 7/16 to (x+1, y)
//    * 3/16 to (x-1, y+1)
//    * 5/16 to (x, y+1)
//    * 1/16 to (x+1, y+1)
```

---

### **Step 4 — Export as PNG Blob**

```js
tempCanvas.toBlob(cb, 'image/png');
```

---

# **4. Ready-to-Use High-Resolution + Dither Export Function**

Paste this into your **utils** folder:

```js
export async function exportHighResGradient({
  draw,
  width,
  height,
  scale = window.devicePixelRatio || 2,
  dither = 'random',
  noiseAmount = 6
}) {
  const cw = width * scale;
  const ch = height * scale;

  const c = document.createElement('canvas');
  c.width = cw;
  c.height = ch;

  const ctx = c.getContext('2d');
  ctx.scale(scale, scale);

  await draw(ctx, width, height);

  let id = ctx.getImageData(0, 0, cw, ch);

  if (dither === 'random') {
    const data = id.data;
    for (let i = 0; i < data.length; i += 4) {
      const d = (Math.random() - 0.5) * noiseAmount;
      data[i]   += d;
      data[i+1] += d;
      data[i+2] += d;
    }
    ctx.putImageData(id, 0, 0);
  }

  if (dither === 'floyd') {
    floydSteinberg(id);
    ctx.putImageData(id, 0, 0);
  }

  return new Promise((resolve) => {
    c.toBlob((b) => resolve(b), 'image/png', 1.0);
  });
}

function clamp(v) {
  return Math.max(0, Math.min(255, v));
}
```

---

# **5. WebGL High-Precision Method (Optional but Best Quality)**

Your agent can implement:

### **5.1 WebGL fragment shader drawing a gradient**

Use floating-point math:

```glsl
precision highp float;
void main() {
  float t = gl_FragCoord.x / u_width;
  vec3 col = mix(color1, color2, t);
  gl_FragColor = vec4(col, 1.0);
}
```

Then export using `gl.readPixels()` to a high-res canvas.

Advantages:

* 32-bit float color precision before quantization
* smoother interpolation
* superior for printing and large wallpapers

---

# **6. Additional Enhancements**

Your agent can add:

### **✔ Export TIFF or 16-bit PNG via wasm (libvips/wasm)**

If high-end print output is required.

### **✔ Optional “grain layer” over gradient**

* Generated in canvas or loaded PNG noise
* Tile with `ctx.globalAlpha = 0.03`
* Removes banding entirely on export

### **✔ CLI automated export using Node + Canvas**

Useful for batch exports.

---

# **7. Final Integration Tasks (Give these to Cursor)**

Tell your Cursor agent:

### **A. Implement the high-resolution export module**

File: `src/utils/exportHighResGradient.js`

### **B. Update existing canvas export code to use the new module**

### **C. Add two dithering modes: `random` and `floyd`**

### **D. Add a setting panel (optional) allowing:**

* export scale
* dithering type
* noise amount
* file format: png / webp-lossless

### **E. Add WebGL shader renderer as an optional rendering engine**

Only if gradient quality must be flawless.

---

# **8. Example Usage (what your agent should integrate)**

```js
const blob = await exportHighResGradient({
  draw: drawMyGradientFn,
  width: canvasWidth,
  height: canvasHeight,
  scale: 3,
  dither: 'random',
  noiseAmount: 4
});
downloadBlob(blob, 'gradient.png');
```

---










Engineering Blueprint for Zero-CLS High-Fidelity Image Export

This report details a comprehensive strategy—ranging from immediate tactical fixes to long-term architectural restructuring—designed to resolve the persistent Cumulative Layout Shift (CLS) and fidelity issues encountered during the high-resolution export process of the Social Media Image Generator. The analysis confirms that the existing high-resolution scaling method, despite incorporating a custom lockdown sequence, fundamentally violates core browser rendering principles, necessitating a paradigm shift in how the preview element is prepared for capture.



  ,
