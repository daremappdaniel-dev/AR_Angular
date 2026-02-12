export interface ThreeVector3 {
    set(x: number, y: number, z: number): this;
    copy(v: ThreeVector3): this;
    lerp(v: ThreeVector3, alpha: number): this;
    x: number;
    y: number;
    z: number;
}
