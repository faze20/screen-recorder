export const EPSILON = 0.001

export function getZoomAtTime(zoomSegments, time) {
  const seg = zoomSegments?.find(z => time >= z.start - EPSILON && time <= z.end + EPSILON)
  if (!seg) return { scale: 1, panX: 0, panY: 0 }
  return { scale: seg.scale, panX: seg.panX || 0, panY: seg.panY || 0 }
}

export function renderFrame(ctx, { time, stageW, stageH, screenVideo, webcamVideo, metadata }) {
  const { background, zoomSegments, webcam } = metadata

  // Background
  ctx.fillStyle = background || '#0c1a13'
  ctx.fillRect(0, 0, stageW, stageH)

  if (!screenVideo) return

  const { scale, panX, panY } = getZoomAtTime(zoomSegments, time)

  // Screen video with zoom
  const vw = screenVideo.videoWidth || stageW
  const vh = screenVideo.videoHeight || stageH
  const aspect = vw / vh
  let drawW = stageW * scale
  let drawH = drawW / aspect
  if (drawH > stageH * scale) {
    drawH = stageH * scale
    drawW = drawH * aspect
  }
  const x = (stageW - drawW) / 2 + panX * stageW
  const y = (stageH - drawH) / 2 + panY * stageH

  ctx.drawImage(screenVideo, x, y, drawW, drawH)

  // Webcam overlay
  if (webcam?.visible && webcamVideo && webcamVideo.videoWidth > 0) {
    const wx = webcam.x
    const wy = webcam.y
    const ww = webcam.width
    const wh = webcam.height

    ctx.save()
    ctx.beginPath()
    ctx.roundRect(wx, wy, ww, wh, 12)
    ctx.clip()
    ctx.drawImage(webcamVideo, wx, wy, ww, wh)
    ctx.restore()

    // Webcam border
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(wx, wy, ww, wh, 12)
    ctx.stroke()
  }
}
