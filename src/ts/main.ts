import { Perlin } from "libnoise-ts/module/generator";
import { RenderElements } from './renderelements.component';
import { MapGenerationFunctions } from './mapGenerationFunctions.component'
import { Config, Position } from './config.component';
import { Color } from './colors.component'

class Island {
	
	// new Perlin(frequency?: number, lacunarity?: number, octaves?: number, persistence?: number, seed?: number, quality?: Quality)
	private _re: RenderElements = new RenderElements();
	private _config: Config = new Config();
	private _perlin: Perlin;
	private calculations: MapGenerationFunctions = new MapGenerationFunctions()
	private dimensions = this.calculations.calculateStraightLinesFromIsometricSquare(this._config.tileWidth, this._config.tileLength)
	private _width: number;
	private _length: number;
	private _containerPixelWidth: number;
	private _containerPixelHeight: number;
	private _map: any[] = [];
	private _triangles: object[] = [];
	private _htmlMap: string = '';
	private _edge: number = 4;
	private _coloring: boolean = true;
	private _defaultColor: string = 'rgb(74, 150, 115)';
	private _colors: ColorDefinition = {
		water: new Color(61, 122, 213),
		grass: new Color(89, 161, 42),
		sand: new Color(245, 231, 60),
		rock: new Color(85, 73, 63)
	}
	private _tileBorders: boolean = false;

	constructor(
		private w: number, 
		private l: number, 
		private noiseScale: number = 25,
		private frequency: number = 1, 
		private lacunarity: number = 1.7, 
		private octaves: number = 4, 
		private persistence: number) {

		this._perlin = new Perlin(frequency, lacunarity, octaves, persistence, new Date().getTime(), 100);

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
					const noiseVal = Math.abs(this._perlin.getValue(x / noiseScale * frequency, y / noiseScale * frequency, 0));

					elevation = Math.floor((chance) * (noiseVal * (chance / 300))); // 10 + (noiseVal*10);
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

				id++;
			}
		}

		const incr = 25;


		// this._map = [
		// 	[
		// 		{ id: 0, x: 0, y: 0, height: 0 },
		// 		{ id: 0, x: 1, y: 0, height: 0 },
		// 		{ id: 0, x: 2, y: 0, height: 0 },
		// 		{ id: 0, x: 3, y: 0, height: 0 },
		// 		{ id: 0, x: 4, y: 0, height: 0 },
		// 		{ id: 0, x: 5, y: 0, height: 0 }
		// 	],
		// 	[
		// 		{ id: 0, x: 0, y: 1, height: 0 },
		// 		{ id: 0, x: 1, y: 1, height: incr },
		// 		{ id: 0, x: 2, y: 1, height: incr },
		// 		{ id: 0, x: 3, y: 1, height: incr },
		// 		{ id: 0, x: 4, y: 1, height: incr },
		// 		{ id: 0, x: 5, y: 1, height: 0 }
		// 	],
		// 	[
		// 		{ id: 0, x: 0, y: 2, height: 0 },
		// 		{ id: 0, x: 1, y: 2, height: incr },
		// 		{ id: 0, x: 2, y: 2, height: incr * 2 },
		// 		{ id: 0, x: 3, y: 2, height: incr * 2 },
		// 		{ id: 0, x: 4, y: 2, height: incr },
		// 		{ id: 0, x: 5, y: 2, height: 0 }
		// 	],
		// 	[
		// 		{ id: 0, x: 0, y: 3, height: 0 },
		// 		{ id: 0, x: 1, y: 3, height: incr },
		// 		{ id: 0, x: 2, y: 3, height: incr * 2 },
		// 		{ id: 0, x: 3, y: 3, height: incr * 2 },
		// 		{ id: 0, x: 4, y: 3, height: incr },
		// 		{ id: 0, x: 5, y: 3, height: 0 }
		// 	],
		// 	[
		// 		{ id: 0, x: 0, y: 4, height: 0 },
		// 		{ id: 0, x: 1, y: 4, height: incr },
		// 		{ id: 0, x: 2, y: 4, height: incr },
		// 		{ id: 0, x: 3, y: 4, height: incr },
		// 		{ id: 0, x: 4, y: 4, height: incr },
		// 		{ id: 0, x: 5, y: 4, height: 0 }
		// 	],
		// 	[
		// 		{ id: 0, x: 0, y: 5, height: 0 },
		// 		{ id: 0, x: 1, y: 5, height: 0 },
		// 		{ id: 0, x: 2, y: 5, height: 0 },
		// 		{ id: 0, x: 3, y: 5, height: 0 },
		// 		{ id: 0, x: 4, y: 5, height: 0 },
		// 		{ id: 0, x: 5, y: 5, height: 0 }
		// 	]
		// ]
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
				
				const point: Position = { "x": (thisPosX + this.dimensions.horizontalWidthFromBottom), "y": (thisPosY + this.dimensions.totalHeight - mapTile.height) }
				const top: Position = { "x": (thisPosX + this.dimensions.horizontalWidthFromTop), "y": thisPosY}
				const left: Position = { "x": thisPosX, "y": (thisPosY + this.dimensions.verticalHeightFromTop) }
				const bottom: Position = { "x": (thisPosX + this.dimensions.horizontalWidthFromBottom), "y": (thisPosY + this.dimensions.totalHeight) }
				const right: Position = { "x": (thisPosX + this.dimensions.totalWidth), "y": (thisPosY + this.dimensions.verticalHeightFromBottom) }
				const newTile = this._re.createTile(thisPosX, thisPosY, mapTile.height);
				
				if (y === 0 && x === this._width - 1) {
					this.setContainerSize({ width: newTile.coords.right.x, height: 0 });
				}

				if (y === this._length - 1 && x === this._width - 1) {
					this.setContainerSize({ width: 0, height: newTile.coords.bottom.y });	
				}

				let yDiff = 0
				if (y < this._length && x < this._width) {
					yDiff = bottom.y - top.y
				}

				const centerX = (top.x + bottom.x) / 2;
				const centerY = (left.y + right.y) / 2 + yDiff;
				let heightDiff = mapTile.height
				let xDiff = 0

				if (y > 0 && x > 0 && y < this._length - 1 && x < this._width - 1) {
					heightDiff = 
						(this._map[y+1][x].height + this._map[y][x+1].height + this._map[y+1][x+1].height) / 3
				}

				this._map[y][x].tileCoords = {
					point,
					center: { x: centerX, y: centerY - heightDiff }
				}

				lastTile = newTile
			}
		}

		const bleed = 0.15;
		let trId = 0;

		for (let y = 0; y < this._length; y++) {
			for (let x = 0; x < this._width; x++) {

				const point = { x: this._map[y][x].tileCoords.point.x, y: this._map[y][x].tileCoords.point.y - bleed }
				let center = { x: this._map[y][x].tileCoords.center.x, y: this._map[y][x].tileCoords.center.y }
				
				let leftPoint = { x: 0, y: 0 };
				let bottomPoint = { x: 0, y: 0 };
				let rightPoint = { x: 0, y: 0 };

				let top = `${this._map[y][x].tileCoords.point.x} ${this._map[y][x].tileCoords.point.y}`;
				let left = `0 0`;
				let bottom = `0 0`;
				let right = `0 0`;

				let topLeftTriangleColor = this._defaultColor;
				let bottomLeftTriangleColor = this._defaultColor;
				let bottomRightTriangleColor = this._defaultColor;
				let topRightTriangleColor = this._defaultColor;

				let leftHeightDiff = 0;
				let bottomHeightDiff = 0;
				let rightHeightDiff = 0;				

				if (x > 0 && y > 0 && y < this._map.length - 1 && x < this._map[0].length - 1) {

					leftPoint = { x: this._map[y + 1][x].tileCoords.point.x - bleed, y: this._map[y + 1][x].tileCoords.point.y + bleed };
					leftHeightDiff = Math.abs(this._map[y + 1][x].height - this._map[y][x].height);
					bottomPoint = { x: this._map[y + 1][x + 1].tileCoords.point.x, y: this._map[y + 1][x + 1].tileCoords.point.y + bleed };
					bottomHeightDiff = Math.abs(this._map[y + 1][x + 1].height - this._map[y][x].height);
					rightPoint = { x: this._map[y][x + 1].tileCoords.point.x + bleed, y: this._map[y][x + 1].tileCoords.point.y + bleed };
					rightHeightDiff = Math.abs(this._map[y][x + 1].height - this._map[y][x].height);

					left = `${leftPoint.x} ${leftPoint.y}`
					bottom = `${bottomPoint.x} ${bottomPoint.y}`
					right = `${rightPoint.x} ${rightPoint.y}`
					const bottomLeft = `${bottomPoint.x + bleed} ${bottomPoint.y}`
					const bottomRight = `${bottomPoint.x - bleed} ${bottomPoint.y}`
					// center = `${this._map[y][x].tileCoords.x} ${this._map[y][x].tileCoords.y}`;

					center = { x: (point.x + bottomPoint.x) / 2, y: (leftPoint.y + rightPoint.y) / 2 }

					// look left
					const leftIsElevated = this._map[y][x].height < this._map[y][x - 1].height ? true : false;
					// look bottom
					const bottomIsElevated = this._map[y][x].height < this._map[y + 1][x].height ? true : false;
					// look right
					const rightIsElevated = this._map[y][x].height < this._map[y][x + 1].height ? true : false;
					// look top
					const topIsElevated = this._map[y][x].height < this._map[y - 1][x].height ? true : false;

					// calculate tilt of each triangle
					const topLeftEdgeCenterPoint = {
						x: (point.x + leftPoint.x) / 2,
						y: (point.y + leftPoint.y) / 2
					};

					const bottomLeftEdgeCenterPoint = {
						x: (leftPoint.x + bottomPoint.x) / 2,
						y: (leftPoint.y + bottomPoint.y) / 2
					};

					const bottomRightEdgeCenterPoint = {
						x: (bottomPoint.x + rightPoint.x) / 2,
						y: (bottomPoint.y + rightPoint.y) / 2
					};

					const topRightEdgeCenterPoint = {
						x: (point.x + rightPoint.x) / 2,
						y: (point.y + rightPoint.y) / 2
					};

					// center to topLeft
					// get height from this and height from left tile / 2
					// height for topLeftCenterPoint is now known
					// height for center point is 0
					// tileLength from config / 2
					// height base and base are both known now
					// height base * base / 2 = long side
					// to calculate angle = tan-1( hypotenuse / base length)

					const topLeftAverageHeight = (this._map[y][x - 1].height + this._map[y][x].height) / 2;
					const bottomLeftAverageHeight = (this._map[y + 1][x].height + this._map[y][x].height) / 2;
					const bottomRightAverageHeight = (this._map[y][x + 1].height + this._map[y][x].height) / 2;
					const topRightAverageHeight = (this._map[y - 1][x].height + this._map[y][x].height) / 2;

					const topLeftAngle = Math.round(this.toDegrees( 
						Math.atan(
							Math.abs(topLeftAverageHeight - this._map[y][x].height) / (this._config.tileWidth / 2)
						)
					));

					const bottomLeftAngle = Math.round(this.toDegrees(
						Math.atan(
							Math.abs(bottomLeftAverageHeight - this._map[y][x].height) / (this._config.tileLength / 2)
						)
					));

					const bottomRightAngle = Math.round(this.toDegrees( 
						Math.atan(
							Math.abs(bottomRightAverageHeight - this._map[y][x].height) / (this._config.tileWidth / 2)
						)
					));

					const topRightAngle = Math.round(this.toDegrees(
						Math.atan(
							Math.abs(topRightAverageHeight - this._map[y][x].height) / (this._config.tileLength / 2)
						)
					));

					// add top left triangle
					this._triangles.push({
						element: trId,
						location: TriangleLocation.topLeft,
						points: [
							point,
							leftPoint,
							center
						],
						height: (this._map[y][x - 1].height + this._map[y][x].height) / 2,
						angle: topLeftAngle
					});
					trId++;

					// add bottom left triangle
					this._triangles.push({
						element: trId,
						location: TriangleLocation.bottomLeft,
						points: [
							leftPoint,
							bottomLeft,
							center
						],
						height: (this._map[y + 1][x].height + this._map[y][x].height) / 2,
						angle: bottomLeftAngle
					});
					trId++;

					// add bottom right triangle
					this._triangles.push({
						element: trId,
						location: TriangleLocation.bottomRight,
						points: [
							bottomRight,
							rightPoint,
							center
						],
						height: (this._map[y][x + 1].height + this._map[y][x].height) / 2,
						angle: bottomRightAngle
					});
					trId++;

					// add top right triangle
					this._triangles.push({
						element: trId,
						location: TriangleLocation.topRight,
						points: [
							point,
							center,
							rightPoint
						],
						height: (this._map[y - 1][x].height + this._map[y][x].height) / 2,
						angle: topRightAngle
					});
					trId++;

					if (this._coloring) {

						topLeftTriangleColor = this._colors.water.hex();
						bottomLeftTriangleColor = this._colors.water.hex();
						bottomRightTriangleColor = this._colors.water.hex();
						topRightTriangleColor = this._colors.water.hex();

						if (leftIsElevated || this._map[y][x].height > 0) {
							const topLeftColor = this._colors.grass;
							topLeftTriangleColor = new Color(this._colors.grass.hex()).changeColorLighting(-topLeftAngle).hex();
							console.log('angle', topLeftAngle);
							console.log('color', topLeftTriangleColor);
							if (this._map[y][x].height === 0) {
								topLeftTriangleColor = `rgb(245, 231, 60)`;
							}
						}

						if (bottomIsElevated || this._map[y][x].height > 0) {
							bottomLeftTriangleColor = new Color(this._colors.grass.hex()).changeColorLighting(-bottomLeftAngle).hex();
							if (this._map[y][x].height === 0) {
								bottomLeftTriangleColor = `rgb(245, 231, 60)`;
							}
						}

						if (rightIsElevated || this._map[y][x].height > 0) {
							bottomRightTriangleColor = new Color(this._colors.grass.hex()).changeColorLighting(bottomRightAngle).hex();
							if (this._map[y][x].height === 0) {
								bottomRightTriangleColor = `rgb(245, 231, 60)`;
							}
						}

						if (topIsElevated || this._map[y][x].height > 0) {
							topRightTriangleColor = new Color(this._colors.grass.hex()).changeColorLighting(topRightAngle).hex();
							if (this._map[y][x].height === 0) {
								topRightTriangleColor = `rgb(245, 231, 60)`;
							}
						}
					}

					let borders = '';
					if (this._tileBorders) borders = 'stroke-width="1" stroke="#222a" '

					// turn this into a createElement function to store the elements in an array
					this._htmlMap += `<g class="tile" style="z-index:${this._map[y][x].id};">
						<path fill="${topLeftTriangleColor}" ${borders}
						d="M${top}
						L${left}
						L${center.x + bleed} ${center.y + bleed}
						L${top} Z" />
						<path fill="${bottomLeftTriangleColor}" ${borders}
						d="M${left}
						L${bottomLeft}
						L${center.x + bleed} ${center.y - bleed}
						L${left} Z" />
						<path fill="${bottomRightTriangleColor}" ${borders}
						d="M${center.x - bleed} ${center.y - bleed}
						L${bottomRight}
						L${right}
						L${center.x - bleed} ${center.y - bleed} Z" />
						<path fill="${topRightTriangleColor}" ${borders}
						d="M${top}
						L${center.x - bleed} ${center.y + bleed}
						L${right}
						L${top} Z" />
						<text x="${this._map[y][x].tileCoords.point.x - 10}" y="${this._map[y][x].tileCoords.point.y - 15}">
							${y}, ${x}
						</text>
						<text x="${this._map[y][x].tileCoords.point.x - 15}" y="${this._map[y][x].tileCoords.point.y - 5}">
							height: ${this._map[y][x].height}
						</text></g>`

					trId++;
				}
			}
		}

		element.innerHTML = this._htmlMap;

		console.log('triangles:', this._triangles);
	}

	private setContainerSize(size: Size2D = { width: 0, height: 0 }) {
		if (size.width !== 0) {
			this._containerPixelWidth = size.width;
		}
		if (size.height !== 0) {
			this._containerPixelHeight = size.height;
		}
	}

	private toRadians (angle: number): number {
		return angle * (Math.PI / 180);
	}

	private toDegrees (angle: number): number {
		return angle * (180 / Math.PI);
	}
}

interface MapTile {
	id: number,
	x: number,
	y: number,
	height: number,
	tileCoords?: {
		point: number
	}
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

interface ColorDefinition {
	[index: string]: Color
}

enum TriangleLocation {
	topLeft = 'TOP_LEFT',
	bottomLeft = 'BOTTOM_LEFT',
	bottomRight = 'BOTTOM_RIGHT',
	topRight = 'TOP_RIGHT'
}

const scaleInput = <HTMLInputElement>document.querySelector('input#scale');
const lacunarityInput = <HTMLInputElement>document.querySelector('input#lacunarity');
const octavesInput = <HTMLInputElement>document.querySelector('input#octaves');
const persistenceInput = <HTMLInputElement>document.querySelector('input#persistence');
const generate = <HTMLInputElement>document.querySelector('#generate');
const el = document.querySelector('#island');

generate.addEventListener('click', () => {
	const map = new Island(40, 40, parseInt(scaleInput.value), 1, parseInt(lacunarityInput.value), parseInt(octavesInput.value), parseInt(persistenceInput.value));
	let mapInfo = map.getMapInfo();

	const width = mapInfo.width * mapInfo.tileWidth;
	const length = mapInfo.length * mapInfo.tileLength;

	map.buildMap(el);
	mapInfo = map.getMapInfo();

	el.setAttribute('width', mapInfo.container.width.toString());
	el.setAttribute('height', mapInfo.container.height.toString());
});