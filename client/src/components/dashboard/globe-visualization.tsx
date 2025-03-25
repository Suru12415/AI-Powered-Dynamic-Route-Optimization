import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Route } from "@shared/schema";

// Import Three.js and related libraries
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface GlobeVisualizationProps {
  routes: Route[];
}

export default function GlobeVisualization({ routes }: GlobeVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"realtime" | "optimized">("optimized");
  
  // Initialize the 3D globe visualization
  useEffect(() => {
    if (!containerRef.current || !routes.length) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0f172a");
    
    // Initialize camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5;
    
    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    
    // Initialize controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.rotateSpeed = 0.5;
    
    // Create Earth globe
    const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
    const earthMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#1e293b"),
      wireframe: false,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);
    
    // Add a glow effect
    const glowGeometry = new THREE.SphereGeometry(2.01, 64, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#0ea5e9"),
      transparent: true,
      opacity: 0.1,
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glowMesh);
    
    // Add a wireframe
    const wireframeGeometry = new THREE.SphereGeometry(2.02, 32, 32);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#334155"),
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    scene.add(wireframeMesh);
    
    // Add route points
    const routePoints = new THREE.Group();
    scene.add(routePoints);

    // Helper function to convert lat/lng to 3D coordinates
    const latLngToVector3 = (lat: number, lng: number, radius: number = 2) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      
      const x = -radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      
      return new THREE.Vector3(x, y, z);
    };
    
    // Add routes to the globe
    routes.forEach(route => {
      if (route.coordinates && route.coordinates.length >= 2) {
        // Origin point
        const originPoint = latLngToVector3(
          route.coordinates[0][1], 
          route.coordinates[0][0]
        );
        const originMarker = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 16, 16),
          new THREE.MeshBasicMaterial({ color: new THREE.Color("#f59e0b") })
        );
        originMarker.position.copy(originPoint);
        routePoints.add(originMarker);
        
        // Destination point
        const destPoint = latLngToVector3(
          route.coordinates[1][1], 
          route.coordinates[1][0]
        );
        const destMarker = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 16, 16),
          new THREE.MeshBasicMaterial({ color: new THREE.Color("#f59e0b") })
        );
        destMarker.position.copy(destPoint);
        routePoints.add(destMarker);
        
        // Create a curve between the points
        const mid = new THREE.Vector3().addVectors(originPoint, destPoint).multiplyScalar(0.5);
        const distance = originPoint.distanceTo(destPoint);
        mid.normalize().multiplyScalar(2 + distance * 0.4);
        
        const curve = new THREE.QuadraticBezierCurve3(
          originPoint,
          mid,
          destPoint
        );
        
        const points = curve.getPoints(50);
        const curveGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const curveMaterial = new THREE.LineBasicMaterial({ 
          color: route.status === "Active" ? 0x0ea5e9 : route.status === "Delayed" ? 0xf59e0b : 0x94a3b8,
          linewidth: 2 
        });
        
        const curveObject = new THREE.Line(curveGeometry, curveMaterial);
        routePoints.add(curveObject);
      }
    });
    
    // Add ambient light to see everything
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      controls.update();
      
      // Slow rotation of the earth
      earthMesh.rotation.y += 0.001;
      glowMesh.rotation.y += 0.001;
      wireframeMesh.rotation.y += 0.001;
      routePoints.rotation.y += 0.001;
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
    };
    
    window.addEventListener("resize", handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      controls.dispose();
    };
  }, [routes, viewMode]);
  
  return (
    <Card className="bg-slate-800 border-slate-700 overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-slate-700 flex-row justify-between items-center">
        <CardTitle className="text-base font-semibold">Global Logistics Network</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant={viewMode === "realtime" ? "default" : "outline"} 
            size="sm" 
            className="text-xs h-8 px-2 bg-slate-900 hover:bg-slate-700 text-slate-300"
            onClick={() => setViewMode("realtime")}
          >
            Real-time
          </Button>
          <Button 
            variant={viewMode === "optimized" ? "default" : "outline"} 
            size="sm" 
            className="text-xs h-8 px-2 bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setViewMode("optimized")}
          >
            Optimized
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div ref={containerRef} className="h-80 w-full" />
      </CardContent>
      
      <CardFooter className="px-4 py-3 border-t border-slate-700 flex items-center justify-between bg-slate-900">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-slate-300">Active Routes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-xs text-slate-300">Hubs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-slate-300">Delays</span>
          </div>
        </div>
        <Button 
          variant="link" 
          size="sm" 
          className="text-xs text-blue-500 hover:text-blue-400"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
