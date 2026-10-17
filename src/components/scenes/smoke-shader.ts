export const smokeVertex = `
attribute vec2 a_position;
void main(){gl_Position=vec4(a_position,0.,1.);}
`;

export const smokeFragment = `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_flow;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,.6,-.6,.8);for(int i=0;i<5;i++){v+=a*noise(p);p=r*p*2.03+4.7;a*=.5;}return v;}
void main(){
 vec2 uv=gl_FragCoord.xy/u_resolution;
 vec2 p=uv*vec2(u_resolution.x/u_resolution.y,1.);
 vec2 displacement=(texture2D(u_flow,uv).rg-vec2(128./255.))*.32;
 p-=displacement*vec2(u_resolution.x/u_resolution.y,1.);
 float t=u_time*.055;
 vec2 q=vec2(fbm(p*2.6+vec2(t,-t)),fbm(p*2.6+vec2(5.2,t)));
 vec2 r=vec2(fbm(p*3.+q*3.+vec2(1.7,-t)),fbm(p*3.+q*3.+vec2(8.3,t)));
 float n=fbm(p*3.5+r*3.2+vec2(t,-t*.6));
 float shape=smoothstep(.30,.70,n);
 float field=exp(-pow((uv.x-.66)*1.6,2.)-pow((uv.y-.55)*1.1,2.));
 float density=shape*field*.83;
 density=clamp(density,0.,.9);
 vec3 paper=vec3(.89,.875,.82);
 vec3 mauve=vec3(.53,.36,.47);
 vec3 amber=vec3(.82,.45,.28);
 vec3 pigment=mix(mauve,amber,smoothstep(.27,.72,r.y+uv.y*.15));
 vec3 color=mix(paper,pigment,density);
 float filament=pow(1.-abs(n-.52)*2.,14.);
 color=mix(color,vec3(.92,.63,.39),filament*.17*field);
 gl_FragColor=vec4(color,1.);
}
`;
