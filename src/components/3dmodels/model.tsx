// src/models/Model.ts
class Model {
  private path: string;
  private position: [number, number, number];
  private rotation: [number, number, number];
  private hovered: boolean;

  constructor(path: string, position: [number, number, number], rotation: [number, number, number]) {
    this.path = path;
    this.position = position;
    this.rotation = rotation;
    this.hovered = false;
  }

  getPath(): string {
    return this.path;
  }

  getPosition(): [number, number, number] {
    return this.position;
  }

  setPosition(position: [number, number, number]): void {
    this.position = position;
  }

  getRotation(): [number, number, number] {
    return this.rotation;
  }

  setRotation(rotation: [number, number, number]): void {
    this.rotation = rotation;
  }

  getHover(): boolean {
    return this.hovered;
  }

  switchHover(hov: boolean): void {
    this.hovered = hov;
  }
}

export default Model;
