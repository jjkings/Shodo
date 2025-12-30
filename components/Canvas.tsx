import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ToolType, Point } from '../types';
import { BRUSH_CONFIG } from '../constants';
import { midPointBtw, distanceBetween, angleBetween } from '../utils/drawingUtils';

interface CanvasProps {
  tool: ToolType;
  stampText: string;
  triggerClear: number;
  onPreviewUpdate: (dataUrl: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ tool, stampText, triggerClear, onPreviewUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Refs for drawing state to avoid re-renders during 60fps loop
  const pointsRef = useRef<Point[]>([]);
  const lastUpdateRef = useRef<number>(0);
  const growthTimerRef = useRef<number | null>(null);
  const currentWidthRef = useRef<number>(0);

  // Initialize Canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Use device pixel ratio for sharp rendering on retina
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      // Fill white background for export compatibility
      ctx.fillStyle = '#fdfbf7'; // Match paper texture color base
      ctx.fillRect(0, 0, rect.width, rect.height);
    }
  }, []);

  useEffect(() => {
    initCanvas();
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, [initCanvas]);

  // Handle Clear
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear and redraw background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fdfbf7'; 
    // We use getBoundingClientRect because ctx coordinates are scaled by DPR
    const rect = canvas.getBoundingClientRect();
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    pointsRef.current = [];
  }, [triggerClear]);

  // Stamp Drawing Logic
  const drawStamp = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const config = BRUSH_CONFIG[ToolType.STAMP];
    const size = config.size;
    const half = size / 2;

    ctx.save();
    ctx.translate(x, y);

    // Shadow/Bleed
    ctx.shadowColor = 'rgba(189, 44, 44, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Box
    ctx.fillStyle = config.color;
    ctx.strokeStyle = config.color;
    
    // Draw rounded rect
    const r = 4; 
    ctx.beginPath();
    ctx.moveTo(-half + r, -half);
    ctx.lineTo(half - r, -half);
    ctx.quadraticCurveTo(half, -half, half, -half + r);
    ctx.lineTo(half, half - r);
    ctx.quadraticCurveTo(half, half, half - r, half);
    ctx.lineTo(-half + r, half);
    ctx.quadraticCurveTo(-half, half, -half, half - r);
    ctx.lineTo(-half, -half + r);
    ctx.quadraticCurveTo(-half, -half, -half + r, -half);
    ctx.fill();

    // Text
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Font sizing logic
    const fontSize = stampText.length > 2 ? size / 2.2 : size / 1.6;
    ctx.font = `bold ${fontSize}px 'Noto Serif JP', serif`;
    
    if (stampText.length === 4) {
      // 2x2 Grid
      ctx.fillText(stampText[0], -size/4, -size/4);
      ctx.fillText(stampText[1], size/4, -size/4);
      ctx.fillText(stampText[2], -size/4, size/4);
      ctx.fillText(stampText[3], size/4, size/4);
    } else if (stampText.length === 2) {
      // Vertical stack
      ctx.fillText(stampText[0], 0, -size/4);
      ctx.fillText(stampText[1], 0, size/4);
    } else {
      // Centered (1 or 3, though 3 looks weird usually)
      ctx.fillText(stampText.substring(0, 3), 0, 0); 
    }

    ctx.restore();
    
    // Update preview for export
    onPreviewUpdate(canvas.toDataURL('image/jpeg', 0.8));
  };

  // Brush Logic
  const startStroke = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling on touch
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get coordinates
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (tool === ToolType.STAMP) {
      drawStamp(x, y);
      return;
    }

    setIsDrawing(true);
    
    const config = BRUSH_CONFIG[tool as ToolType.FUTO_FUDE | ToolType.HOSO_FUDE];
    currentWidthRef.current = config.minWidth;
    
    pointsRef.current = [{ x, y, width: config.minWidth, time: Date.now() }];
    
    // Initial dot drawing immediately
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = config.color;
        ctx.beginPath();
        ctx.arc(x, y, config.minWidth / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Start growth timer for stationary hold
    if (growthTimerRef.current) clearInterval(growthTimerRef.current);
    
    growthTimerRef.current = window.setInterval(() => {
      // If we are holding down but not moving (or moving very slowly, handled by move logic), grow the brush
      if (currentWidthRef.current < config.maxWidth) {
        currentWidthRef.current += config.growthRate;
        
        // Redraw the dot at current position with new size
        if (ctx) {
          ctx.beginPath();
          ctx.arc(x, y, currentWidthRef.current / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Update the last point's width
        const lastPoint = pointsRef.current[pointsRef.current.length - 1];
        if (lastPoint) {
            lastPoint.width = currentWidthRef.current;
        }
      }
    }, 16); // 60fps approximate
  };

  const moveStroke = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || tool === ToolType.STAMP) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Cancel growth timer if we start moving
    if (growthTimerRef.current) {
        clearInterval(growthTimerRef.current);
        growthTimerRef.current = null;
    }

    const points = pointsRef.current;
    const lastPoint = points[points.length - 1];
    const now = Date.now();

    // Physics Simulation
    const dist = distanceBetween(lastPoint, { x, y, width: 0, time: 0 });
    const timeDiff = now - lastPoint.time;
    
    // If move is too small, ignore to avoid jagged stack
    if (dist < 2) return;

    const velocity = dist / (timeDiff || 1); // pixels per ms
    const config = BRUSH_CONFIG[tool as ToolType.FUTO_FUDE | ToolType.HOSO_FUDE];
    
    // Calculate target width based on velocity (faster = thinner)
    // We invert velocity influence.
    const newWidth = Math.max(
        config.minWidth, 
        Math.min(config.maxWidth, currentWidthRef.current - (velocity * config.velocityFactor * 20))
    );
    
    // Smooth transition for width (simple Lerp)
    currentWidthRef.current = currentWidthRef.current * 0.7 + newWidth * 0.3;

    const newPoint = { x, y, width: currentWidthRef.current, time: now };
    points.push(newPoint);

    // Draw Curve
    // We need at least 3 points to draw a quadratic curve properly
    if (points.length > 2) {
      const p1 = points[points.length - 2];
      const p2 = points[points.length - 1];
      const mid = midPointBtw(p1, p2);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      
      // Dynamic line width handling is tricky with standard stroke(). 
      // We simulate variable width by drawing many circles or filling a polygon.
      // For performance and "ink" look, we'll use quadratic curves with variable line width 
      // by breaking the curve into small segments if needed, but standard canvas handles
      // width changes on lineTo poorly (stepy).
      
      // High-quality approach: Trapezoid filling between points perpendicular to direction? 
      // Simplified robust approach for web:
      
      ctx.lineWidth = p1.width;
      ctx.strokeStyle = config.color;
      
      // To smooth the joint, we use the midpoint technique
      // Start at previous mid
      const p0 = points[points.length - 3];
      const mid0 = midPointBtw(p0, p1);
      
      ctx.beginPath();
      ctx.moveTo(mid0.x, mid0.y);
      ctx.quadraticCurveTo(p1.x, p1.y, mid.x, mid.y);
      
      // Line width interpolation is hard here. 
      // For a truly realistic brush, we would fill shapes.
      // Let's approximate by setting lineWidth to the average of p1 and p2
      ctx.lineWidth = p1.width; 
      ctx.stroke();
      
      // Draw a circle at the joint to smooth out width transitions
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, p1.width / 2, 0, Math.PI * 2);
      ctx.fillStyle = config.color;
      ctx.fill();
    }
  };

  const endStroke = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (growthTimerRef.current) {
        clearInterval(growthTimerRef.current);
        growthTimerRef.current = null;
    }
    
    // Save preview
    const canvas = canvasRef.current;
    if (canvas) {
        onPreviewUpdate(canvas.toDataURL('image/jpeg', 0.8));
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-crosshair">
      <canvas
        ref={canvasRef}
        className="touch-none absolute top-0 left-0 paper-texture shadow-inner"
        onMouseDown={startStroke}
        onMouseMove={moveStroke}
        onMouseUp={endStroke}
        onMouseLeave={endStroke}
        onTouchStart={startStroke}
        onTouchMove={moveStroke}
        onTouchEnd={endStroke}
      />
    </div>
  );
};