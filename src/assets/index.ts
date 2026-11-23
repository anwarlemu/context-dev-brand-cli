// The asset renderer as a module, for other commands (illustrate, figma) and for scripts:
//
//   import { surface, toPng, toSvg, drawDotField, samplePicture, readPicture } from '<package>/dist/assets/index.js';
//   const s = surface(1200, 630);                      // a canvas in frame pixels ({ scale, svg: true } for SVG)
//   s.ctx.fillStyle = tokenColor('brand');             // colors only by token name
//   drawDotField(s.ctx, { width: 1200, height: 630, dot: 7.6, gap: 3.8, colors: paletteOf({ palette: 'Paper' }),
//     picture: await readPicture(cwd, 'hero.png') });  // any picture through the dot shader
//   writeFileSync('out.png', toPng(s));                // deterministic bytes; toSvg(s) on an svg surface
//
// Everything brand-specific comes from brand/ (tokens, fonts, logo.json, assets/*.json); nothing here names the brand.

export { brandFonts, compactSvg, lightnessOf, pixelsOf, scratch, surface, toPng, toSvg, tokenColor, type AnyCanvas, type Ctx, type Fonts, type Surface } from './canvas.js';
export { cutout, grid, hexLightness, shade, type Dither, type Grid, type Rect, type Render, type ShaderOpts, type States } from './shader.js';
export { drawBurst, drawDotField, dotIcon, dotText, placePicture, RING, SHADER_DEFAULTS, type DotFieldOptions, type FieldColors } from './dots.js';
export { drawFitted, fit, setFont, wrap, type Fitted, type TextStyle } from './text.js';
export { drawLogo, drawMark, logoRatio, markRatio } from './logo.js';
export { pictureFrom, pictureKind, pictureOf, readPicture, type Picture } from './picture.js';
export { samplePicture, sampleNames } from './samples.js';
export { designFor, drawDesign, frameOf, imageDoc, paletteOf, palettes, TEMPLATES, type Design, type Palette, type Template } from './og.js';
export { designOf, imageCatalog, imageSizes, pictureFor, renderDesign, sizeId, type ImageRequest, type Rendered } from './image.js';
export { deckCatalog, drawSlide, renderSlide, slideTypes, type Slide, type SlideType } from './deck.js';
export { drawItem, findItem, merchCatalog, merchItems, renderItem, PX_PER_IN, type MerchItem } from './merch.js';
export { drawLoopFrame, encode, hasFfmpeg, loopFrames, loopTemplates, reelFrames, reelHtml, videoCatalog, type LoopOptions, type ReelCopy } from './video.js';
export { encodePng } from './png.js';
export { imagesToPdf, type PdfPage } from './pdf.js';
export { display, num, pick, suggest, unknown, write, type OutFile } from './io.js';
