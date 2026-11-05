/**
 * W1 Capital — interactive refractive prism.
 * Original implementation from W1's visual brief, using Three.js and 2D
 * Cauchy/Snell ray tracing. The visual direction references the MIT-licensed
 * vercel-labs/vgpu prism example; its WGSL/shader code is not copied here.
 * Fails safely to 2D if WebGL/third-party module cannot load.
 */
(() => {
  "use strict";
  const hero = document.querySelector(".hero.section");
  if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const stage = document.createElement("div");
  stage.className = "w1-prism-stage";
  stage.setAttribute("aria-hidden", "true");
  const lightCanvas = document.createElement("canvas");
  lightCanvas.className = "w1-prism-fx";
  const glassCanvas = document.createElement("canvas");
  glassCanvas.className = "w1-prism-gl";
  const signature = document.createElement("span");
  signature.className = "w1-prism-signature";
  signature.textContent = "Luz em movimento";
  stage.append(lightCanvas, glassCanvas, signature);
  hero.insertBefore(stage, hero.firstChild);
  const ctx = lightCanvas.getContext("2d");
  if (!ctx) { stage.remove(); return; }

  const V = (x, y) => ({x, y});
  const plus = (a,b) => V(a.x+b.x,a.y+b.y);
  const minus = (a,b) => V(a.x-b.x,a.y-b.y);
  const times = (a,k) => V(a.x*k,a.y*k);
  const dot = (a,b) => a.x*b.x+a.y*b.y;
  const cross = (a,b) => a.x*b.y-a.y*b.x;
  const norm = a => times(a,1/Math.max(0.000001,Math.hypot(a.x,a.y)));
  const rotate = (a,r) => V(a.x*Math.cos(r)-a.y*Math.sin(r),a.x*Math.sin(r)+a.y*Math.cos(r));
  const mix = (a,b,t) => a+(b-a)*t;
  const clamp = (x,a,b) => Math.max(a,Math.min(b,x));

  // Snell's law with a surface normal pointing INTO the incident medium.
  function refract(dir, incidentNormal, ratio) {
    const c = clamp(-dot(dir,incidentNormal),-1,1);
    const k = 1-ratio*ratio*(1-c*c);
    if (k < 0) return null; // total internal reflection
    return norm(plus(times(dir,ratio),times(incidentNormal,ratio*c-Math.sqrt(k))));
  }
  function reflect(dir, normal) {
    return norm(minus(dir,times(normal,2*dot(dir,normal))));
  }
  function spectrum(nm) {
    let r=0,g=0,b=0;
    if(nm<440){r=(440-nm)/30;b=1}
    else if(nm<490){g=(nm-440)/50;b=1}
    else if(nm<510){g=1;b=(510-nm)/20}
    else if(nm<580){r=(nm-510)/70;g=1}
    else if(nm<645){r=1;g=(645-nm)/65}
    else {r=1}
    const fade=nm<425?mix(.35,1,(nm-410)/15):nm>665?mix(1,.42,(nm-665)/30):1;
    return [Math.round(clamp(r*fade,0,1)*255),Math.round(clamp(g*fade,0,1)*255),Math.round(clamp(b*fade,0,1)*255)];
  }
  function intersectRay(origin,dir,a,b) {
    const side=minus(b,a), denom=cross(dir,side);
    if (Math.abs(denom)<0.00001) return null;
    const diff=minus(a,origin), t=cross(diff,side)/denom, u=cross(diff,dir)/denom;
    return t>0.02 && u>0.00001 && u<.99999 ? {t, point:plus(origin,times(dir,t))} : null;
  }

  const aim = {x:.56,y:.42}, target={x:.56,y:.42};
  let pointerAt=performance.now();
  let W=0,H=0,tri=[],normals=[],S=0,center=V(0,0),device=1,mobile=false,visible=true;
  let THREE=null,renderer=null,scene=null,camera=null,mesh=null,edgeLines=null,frame=0;
  let disposed=false;

  function layout() {
    const rect=stage.getBoundingClientRect();
    W=Math.max(1,Math.round(rect.width));
    H=Math.max(1,Math.round(rect.height));
    mobile=W<820;
    device=Math.min(window.devicePixelRatio||1,mobile?1.5:2);
    lightCanvas.width=Math.round(W*device);
    lightCanvas.height=Math.round(H*device);
    ctx.setTransform(device,0,0,device,0,0);
    S=mobile?Math.min(W*.62,H*.37,330):Math.min(W*.29,H*.58,465);
    center=mobile?V(W*.52,H*.57):V(W*.78,H*.5);
    const R=S/Math.sqrt(3);
    tri=[V(center.x,center.y-R),V(center.x+S/2,center.y+R/2),V(center.x-S/2,center.y+R/2)];
    normals=tri.map((a,i)=>{
      const b=tri[(i+1)%3], d=minus(b,a);
      return norm(V(d.y,-d.x));
    });
    if (renderer) {
      renderer.setPixelRatio(device);
      renderer.setSize(W,H,false);
      camera.left=-W/2;camera.right=W/2;camera.top=H/2;camera.bottom=-H/2;
      camera.updateProjectionMatrix();
      if(mesh) {
        scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.geometry=buildGeometry();
        scene.add(mesh);
        mesh.position.set(center.x-W/2,H/2-center.y,0);
      }
      if(edgeLines) {
        scene.remove(edgeLines);
        edgeLines.geometry.dispose();
        edgeLines.geometry=new THREE.EdgesGeometry(mesh.geometry,19);
        scene.add(edgeLines);
        edgeLines.position.copy(mesh.position);
      }
    }
  }

  function traceWavelength(nm,entry,initial) {
    const wavelength=nm/1000, n=1.2+.1/(wavelength*wavelength);
    let ray=refract(initial,normals[0],1/n);
    if(!ray) return null;
    const traveled=[entry];
    let at=plus(entry,times(ray,.08));
    for(let bounce=0;bounce<7;bounce++) {
      let best=null;
      for(let edge=0;edge<3;edge++){
        const hit=intersectRay(at,ray,tri[edge],tri[(edge+1)%3]);
        if(hit&&(!best||hit.t<best.t))best={...hit,edge};
      }
      if(!best) return null;
      traveled.push(best.point);
      const N=normals[best.edge];
      const leave=refract(ray,times(N,-1),n);
      if(leave) return {inside:traveled,exit:best.point,out:leave,nm};
      ray=reflect(ray,N);
      at=plus(best.point,times(ray,.08));
    }
    return null;
  }

  function line(a,b,width,style,alpha,blur=0) {
    ctx.save();
    ctx.globalAlpha=alpha;ctx.lineWidth=width;ctx.strokeStyle=style;
    ctx.lineCap="round";ctx.shadowBlur=blur;ctx.shadowColor=style;
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.restore();
  }

  function paintGlassFallback() {
    ctx.save();
    ctx.beginPath();tri.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();
    const gradient=ctx.createLinearGradient(center.x-S*.4,center.y-S*.6,center.x+S*.5,center.y+S*.6);
    gradient.addColorStop(0,"#dce7ff1c");gradient.addColorStop(.48,"#e5ddec45");gradient.addColorStop(1,"#ffd2e218");
    ctx.fillStyle=gradient;ctx.shadowColor="#e7d1ed81";ctx.shadowBlur=25;ctx.fill();
    ctx.lineWidth=2;ctx.strokeStyle="#eee7ffad";ctx.stroke();ctx.restore();
  }

  function paint(time) {
    ctx.clearRect(0,0,W,H);
    if(!tri.length)return;
    const right=tri[1], top=tri[0];
    const entry=V(mix(top.x,right.x,mix(.18,.80,aim.x)),mix(top.y,right.y,mix(.18,.80,aim.x)));
    // The lamp arrives from the right, then disperses towards the left.
    const incoming=norm(rotate(times(normals[0],-1),mix(.95,1.20,1-aim.y)));
    const far=Math.hypot(W,H)*1.65;
    const source=minus(entry,times(incoming,far));
    const count=mobile?44:72;
    const beams=[];
    for(let i=0;i<count;i++){
      const nm=410+(695-410)*i/(count-1);
      const ray=traceWavelength(nm,entry,incoming);
      if(ray){
        ray.color=spectrum(nm);
        ray.end=plus(ray.exit,times(ray.out,far));
        beams.push(ray);
      }
    }

    ctx.save();
    ctx.globalCompositeOperation="lighter";
    // Soft atmospheric illumination around the prism.
    const halo=ctx.createRadialGradient(center.x,center.y,5,center.x,center.y,S*.95);
    halo.addColorStop(0,"#eac9ef2b");halo.addColorStop(.5,"#b77ad411");halo.addColorStop(1,"#24051000");
    ctx.fillStyle=halo;ctx.fillRect(center.x-S,center.y-S,S*2,S*2);

    // Continuous glowing dispersion band rather than discrete neon stripes.
    for(let i=0;i<beams.length-1;i++){
      const a=beams[i],b=beams[i+1],color=a.color;
      const grad=ctx.createLinearGradient(a.exit.x,a.exit.y,a.end.x,a.end.y);
      grad.addColorStop(0,`rgba(${color[0]},${color[1]},${color[2]},0.45)`);
      grad.addColorStop(.26,`rgba(${color[0]},${color[1]},${color[2]},0.32)`);
      grad.addColorStop(.66,`rgba(${color[0]},${color[1]},${color[2]},0.11)`);
      grad.addColorStop(1,`rgba(${color[0]},${color[1]},${color[2]},0)`);
      ctx.fillStyle=grad;
      ctx.beginPath();ctx.moveTo(a.exit.x,a.exit.y);ctx.lineTo(a.end.x,a.end.y);
      ctx.lineTo(b.end.x,b.end.y);ctx.lineTo(b.exit.x,b.exit.y);
      ctx.closePath();ctx.fill();
    }
    for(let i=0;i<beams.length;i+=mobile?3:2){
      const r=beams[i],c=r.color;
      const color=`rgb(${c[0]},${c[1]},${c[2]})`;
      line(r.exit,r.end,7,color,.085,22);
      line(r.exit,r.end,2.1,color,.12,6);
      if(i%6===0){
        const path=r.inside;
        for(let j=1;j<path.length;j++)line(path[j-1],path[j],1.15,color,.18,2);
      }
    }

    // White incoming beam: bright core, delicate fog and moving light dust.
    line(source,entry,mobile?8:12,"#e9f4ff",.17,36);
    line(source,entry,mobile?3.4:4.4,"#fff",.69,10);
    line(source,entry,1.3,"#fff",.96,3);
    const length=Math.hypot(entry.x-source.x,entry.y-source.y);
    for(let i=0;i<65;i++){
      const f=(i*0.61803398875+time*.000012*(1+i%3))%1;
      const p=plus(source,times(incoming,length*f));
      if(p.x<0||p.x>W||p.y<0||p.y>H)continue;
      const p2=V(-incoming.y,incoming.x);
      const spread=(1-f)*19*Math.sin(i*83.53);
      const pt=plus(p,times(p2,spread));
      ctx.fillStyle=`rgba(255,241,250,${.15+.38*(.5+.5*Math.sin(time*.002+i))})`;
      ctx.beginPath();ctx.arc(pt.x,pt.y,.45+(i%4)*.26,0,Math.PI*2);ctx.fill();
    }
    line(top,right,2.3,"#f2eaff",.52,14);
    ctx.beginPath();ctx.fillStyle="#fff";
    ctx.arc(entry.x,entry.y,2.1,0,Math.PI*2);ctx.fill();
    ctx.restore();

    if(!renderer)paintGlassFallback();
  }

  function buildGeometry() {
    const r=S/Math.sqrt(3);
    const shape=new THREE.Shape();
    shape.moveTo(0,r);shape.lineTo(S/2,-r/2);shape.lineTo(-S/2,-r/2);shape.closePath();
    const depth=S*.23;
    const geo=new THREE.ExtrudeGeometry(shape,{
      depth,bevelEnabled:true,bevelThickness:S*.009,
      bevelSize:S*.008,bevelSegments:4,steps:1,curveSegments:12
    });
    geo.translate(0,0,-depth/2);
    return geo;
  }

  async function setupWebGL() {
    try{
      const module=await import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js");
      if(disposed)return;
      THREE=module;
      if(!glassCanvas.getContext("webgl2",{alpha:true,antialias:true}))return;
      renderer=new THREE.WebGLRenderer({
        canvas:glassCanvas,alpha:true,antialias:true,powerPreference:"low-power"
      });
      renderer.setClearColor(0,0);
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure=1.75;
      scene=new THREE.Scene();
      camera=new THREE.OrthographicCamera(-W/2,W/2,H/2,-H/2,.01,2500);
      camera.position.set(0,0,1100);camera.lookAt(0,0,0);
      scene.add(new THREE.HemisphereLight(0xeef0ff,0x41203b,2.9));
      const key=new THREE.DirectionalLight(0xffffff,3.8);
      key.position.set(-350,500,650);scene.add(key);
      const pink=new THREE.DirectionalLight(0xff779d,2.1);
      pink.position.set(550,-250,350);scene.add(pink);
      const material=new THREE.MeshPhysicalMaterial({
        color:0xe3eaff,roughness:.07,metalness:0,
        transmission:.92,thickness:2.3,ior:1.645,
        transparent:true,opacity:.79,side:THREE.DoubleSide,
        clearcoat:1,clearcoatRoughness:.04
      });
      mesh=new THREE.Mesh(buildGeometry(),material);
      mesh.position.set(center.x-W/2,H/2-center.y,0);
      scene.add(mesh);
      edgeLines=new THREE.LineSegments(
        new THREE.EdgesGeometry(mesh.geometry,19),
        new THREE.LineBasicMaterial({color:0xeedcea,transparent:true,opacity:.48})
      );
      edgeLines.position.copy(mesh.position);scene.add(edgeLines);
      renderer.setPixelRatio(device);renderer.setSize(W,H,false);
      return true;
    }catch(error){
      console.warn("[W1 prism] 3D indisponível; usando desenho 2D.",error);
      renderer?.dispose();renderer=null;scene=null;
      return false;
    }
  }

  function animate(time) {
    if(disposed)return;
    frame=requestAnimationFrame(animate);
    if(!visible)return;
    if(time-pointerAt>6000){
      const t=time/18000*Math.PI*2;
      target.x=.5+.23*Math.cos(t);target.y=.5+.23*Math.sin(t);
    }
    const ease=1-Math.pow(1-.11,Math.min(4,Math.max(.5,((time-(animate.previousTime||time))/16.67))));
    animate.previousTime=time;
    aim.x=mix(aim.x,target.x,ease);aim.y=mix(aim.y,target.y,ease);
    paint(time);
    if(renderer&&mesh){
      mesh.rotation.y=mix(mesh.rotation.y,(aim.x-.5)*.12,.07);
      mesh.rotation.x=mix(mesh.rotation.x,(aim.y-.5)*-.09,.07);
      edgeLines.rotation.copy(mesh.rotation);
      renderer.render(scene,camera);
    }
  }

  function updatePointer(event) {
    if(event.isPrimary===false)return;
    const rect=stage.getBoundingClientRect();
    target.x=clamp((event.clientX-rect.left)/Math.max(rect.width,1),0,1);
    target.y=clamp((event.clientY-rect.top)/Math.max(rect.height,1),0,1);
    pointerAt=performance.now();
  }
  hero.addEventListener("pointermove",updatePointer,{passive:true});
  hero.addEventListener("pointerdown",updatePointer,{passive:true});
  hero.addEventListener("pointerleave",()=>{pointerAt=0;},{passive:true});
  document.addEventListener("visibilitychange",()=>{visible=!document.hidden});
  if("IntersectionObserver" in window){
    new IntersectionObserver(entries=>{
      visible=entries[0]?.isIntersecting&&!document.hidden;
    },{threshold:.04}).observe(hero);
  }
  let resizeTimer;
  window.addEventListener("resize",()=>{
    clearTimeout(resizeTimer);resizeTimer=setTimeout(layout,60);
  },{passive:true});
  if("ResizeObserver" in window)new ResizeObserver(()=>{if(stage.isConnected)layout()}).observe(stage);
  const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
  motion.addEventListener?.("change",()=>{if(motion.matches){disposed=true;cancelAnimationFrame(frame);hero.classList.remove("w1-prismatic");stage.remove();renderer?.dispose()}});
  (async()=>{
    layout();
    await setupWebGL();
    if(disposed)return;
    hero.classList.add("w1-prismatic");
    animate(performance.now());
  })();
})();
