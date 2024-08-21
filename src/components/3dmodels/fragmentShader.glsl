void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec3 color = vec3(uv.x, uv.y, 0.5);
  
  gl_FragColor = vec4(color, 1.0);
}