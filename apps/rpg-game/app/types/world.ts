type Camera = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type Layer = {
  isStatic: boolean;
};

type Tile = string[];

type Row = Tile[];

type MapType = Row[];

export interface WorldType {
  camera: Camera;
  layers: Layer[];
  map: MapType;
}
