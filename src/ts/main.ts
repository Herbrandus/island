import { Perlin } from "libnoise-ts/module/generator";
import { RenderElements } from './renderelements.component';
import { Config } from './config.component';

class Island {
	
	// new Perlin(frequency?: number, lacunarity?: number, octaves?: number, persistence?: number, seed?: number, quality?: Quality)
	private _re: RenderElements = new RenderElements();
	private _config: Config = new Config();
	private _perlin: Perlin = new Perlin(2, 3, 1);
	private _width: number;
	private _length: number;
	private _containerPixelWidth: number;
	private _containerPixelHeight: number;
	private _map: any[] = [];
	private _htmlMap: string = '';
	private _edge: number = 4;


	constructor(private w: number, private l: number) {

		let id = 0;
		this._width = w;
		this._length = l;

		const highestPointX = (this._edge*2) + Math.floor(Math.random() * (w - (this._edge*4)));
		const highestPointY = (this._edge*2) + Math.floor(Math.random() * (l - (this._edge*4)));

		const westDiff = highestPointX - 1;
		const eastDiff = (w - highestPointX);

		const northDiff = highestPointY - 1;
		const southDiff = (l - highestPointY);

		const islandSize = 45 + (Math.floor(Math.random()*5)*10);

		for (let y = 0; y < l; y++) {

			this._map[y] = [] as MapTile[];

			for (let x = 0; x < w; x++) {
				//const noiseVal = Math.abs(this._perlin.getValue(x / 25, y / 25, 0));
				
				// let noiseVal = (-0.15 * Math.pow(x, 2) + 53) / 40;
				// noiseVal = noiseVal < 0 ? 0 : noiseVal;

				let yChance = 50;
				let xChance = 50;

				// functions to calculate chance for higher elevation the closer to the highest point
				if (y < highestPointY) {
					yChance = Math.floor(((y/northDiff)/2)*100);
					// console.log('north ('+y+'): '+yChance);
				} else if (y > highestPointY) {
					yChance = Math.floor((((l - y)/southDiff)/2)*100);
					// console.log('south ('+y+'): '+yChance);
				}

				// functions to calculate chance for higher elevation the closer to the highest point
				if (x < highestPointX) {
					xChance = Math.floor(((x/westDiff)/2)*100);
					// console.log('west ('+x+'): '+xChance);
				} else if (x > highestPointX) {
					xChance = Math.floor((((w - x)/eastDiff)/2)*100);
					// console.log('east ('+x+'): '+xChance);
				}

				// add chance together
				let chance = yChance + xChance;
				let elevation = 0;

				if (chance > 88) {
					chance = 100;
				}

				if (islandSize < chance) {
					// noise
					const noiseVal = Math.abs(this._perlin.getValue(x / 25, y / 25, 0));

					elevation = Math.floor((chance) * (noiseVal * (chance / 200))); // 10 + (noiseVal*10);
					if (elevation <= 0) {
						elevation = 0;
					}
				} else {
					elevation = 0;
				}

				const tile: MapTile = {
					id,
					x,
					y,
					height: elevation
				}

				this._map[y][x] = tile;
			}
		}
	}

	getMapInfo(): MapInfo {
		return {
			width: this._width,
			length: this._length,
			tileWidth: this._config.tileWidth,
			tileLength: this._config.tileLength,
			container: {
				width: this._containerPixelWidth,
				height: this._containerPixelHeight
			}
		}
	}

	getMap(): any[] {
		return this._map;
	}

	buildMap(element: Element) {

		let mapTotalWidth = this._width
		let mapTotalLength = this._length
		let testTile = this._re.createTile(0, 0, 0)

		let xDeviation = testTile.coords.bottom.x - testTile.coords.top.x
		let yDeviation = testTile.coords.right.y - testTile.coords.left.y
		let tileHalfWidthLeft = testTile.coords.top.x - testTile.coords.left.x
		let tileHalfWidthRight = testTile.coords.right.x - testTile.coords.top.x
		let mapWidthLeft = tileHalfWidthLeft * mapTotalLength
		let mapWidthRight = tileHalfWidthRight * mapTotalWidth
		let tileHalfLengthTop = testTile.coords.right.y
		let tileHalfLengthBottom = testTile.coords.bottom.y - testTile.coords.right.y
		let mapLengthTop = tileHalfLengthTop * mapTotalWidth
		let mapLengthBottom = tileHalfLengthBottom * mapTotalLength
		let mapWidthPx = Math.round((tileHalfWidthLeft + tileHalfWidthRight) * (mapTotalWidth ))
		let mapLengthPx = Math.round(mapLengthTop + mapLengthBottom) + this._config.topMargin

		let lastTile = null
		let startTileX = tileHalfWidthLeft * (mapTotalWidth - 1)

		for (let y = 0; y < this._length; y++) {
			for (let x = 0; x < this._width; x++) {

				let thisPosY = 0
				let thisPosX = 0
				let mapTile: MapTile = this._map[y][x];

				console.log(mapTile);

				if (x === 0 && y === 0) {
					thisPosX = startTileX
				}

				if (lastTile != null) {
					thisPosY = lastTile.coords.right.y
				}

				if (y > 0 && x === 0) {
					thisPosX = startTileX - (tileHalfWidthLeft * y)
					thisPosY = (tileHalfLengthTop * y) - (yDeviation * y)
				}	
				
				if (x > 0) {
					thisPosX = (lastTile.coords.right.x - (lastTile.coords.right.x - lastTile.coords.bottom.x))
				}

				// let newTile = this._re.createTile(thisPosX, thisPosY, mapTile.height);
				const newTile = this._re.createPolygon({ map: this._map, x, y }, thisPosX, thisPosY, mapTile.height);

				this._htmlMap += newTile.html;

				if (y === 0 && x === this._width - 1) {
					this.setContainerSize({ width: newTile.coords.right.x, height: 0 });
				}

				if (y === this._length - 1 && x === this._width - 1) {
					this.setContainerSize({ width: 0, height: newTile.coords.bottom.y });	
				}

				lastTile = newTile
			}
		}

		element.innerHTML = this._htmlMap;
	}

	private setContainerSize(size: Size2D = { width: 0, height: 0 }) {
		if (size.width !== 0) {
			this._containerPixelWidth = size.width;
		}
		if (size.height !== 0) {
			this._containerPixelHeight = size.height;
		}
	}
}

interface MapTile {
	id: number,
	x: number,
	y: number,
	height: number
}

interface Size2D {
	width: number,
	height: number
}

interface MapInfo {
	width: number,
	length: number,
	tileWidth: number,
	tileLength: number,
	container: {
		width: number,
		height: number
	}
}

const map = new Island(6, 6);
let mapInfo = map.getMapInfo();
const el = document.querySelector('#island');

console.log(map.getMap());

const width = mapInfo.width * mapInfo.tileWidth;
const length = mapInfo.length * mapInfo.tileLength;

console.log(width, length);

map.buildMap(el);
mapInfo = map.getMapInfo();

el.setAttribute('width', mapInfo.container.width.toString());
el.setAttribute('height', mapInfo.container.height.toString());

