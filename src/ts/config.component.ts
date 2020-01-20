export class Config {

	private _allowDebug: boolean = true
	private _tileWidth: number = 12
	private _tileLength: number = 12
	private _tileHeight: number = 10
	private _tileSmallAngle: number = 85
	private _tileLargeAngle: number = 100
	private _tileEdgeBleed: number = 0.3
	private _maxAllowedHeight: number = 12
	private _topMargin: number = 80

	constructor() {	}

	public get allowDebug(): boolean {
		return this._allowDebug
	}

	public get tileWidth(): number {
		return this._tileWidth
	}

	public get tileLength(): number {
		return this._tileLength
	}

	public get tileHeight(): number {
		return this._tileHeight
	}

	public get tileSmallAngle(): number {
		return this._tileSmallAngle
	}

	public get tileLargeAngle(): number {
		return this._tileLargeAngle
	}

	public get tileEdgeBleed(): number {
		return this._tileEdgeBleed
	}

	public get maxAllowedHeight(): number {
		return this._maxAllowedHeight
	}

	public get topMargin(): number {
		return this._topMargin
	}

	public getMapWidth(mapArrayWidth: number): number {
		return mapArrayWidth * this._tileWidth
	}

	public getMapLength(mapArrayLength: number): number {
		return mapArrayLength * this._tileLength
	}
}

export interface Coords {
	top?: Position,
	left?: Position,
	bottom?: Position,
	right?: Position
}

export interface TileTemplate {
	html?: string,
	coords?: Coords
}

export interface Position {
	x?: number,
	y?: number
}

export interface Dimensions {
	w?: number,
	l?: number
}