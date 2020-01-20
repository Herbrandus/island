import { Config, Coords, TileTemplate, Position } from './config.component'
import { MapGenerationFunctions } from './mapGenerationFunctions.component'
import { Tile, TileType } from './tile.component'
import { Color } from './colors.component'

export class RenderElements {

	private config: Config = new Config()
	private calculations: MapGenerationFunctions = new MapGenerationFunctions()

	private tileW: number = this.config.tileWidth
	private tileL: number = this.config.tileLength
	private tileH: number = this.config.tileHeight
	private bleed: number = this.config.tileEdgeBleed
	private dimensions = this.calculations.calculateStraightLinesFromIsometricSquare(this.tileW, this.tileL)

	private tileColor: Color = new Color(152, 142, 189)

	createTile(xPos: number, yPos: number, height?: number, color?: string): TileTemplate {

		let top: Position = { "x": (xPos + this.dimensions.horizontalWidthFromTop), "y": yPos}
		let left: Position = { "x": xPos, "y": (yPos + this.dimensions.verticalHeightFromTop) }
		let bottom: Position = { "x": (xPos + this.dimensions.horizontalWidthFromBottom), "y": (yPos + this.dimensions.totalHeight) }
		let right: Position = { "x": (xPos + this.dimensions.totalWidth), "y": (yPos + this.dimensions.verticalHeightFromBottom) }

		let pointTop = `${top.x} ${top.y-this.bleed}`
		let pointLeft = `${left.x-this.bleed} ${left.y}`
		let pointBottom = `${bottom.x} ${bottom.y+this.bleed}`
		let pointRight = `${right.x+this.bleed} ${right.y}`

		let leftSideLeftTop = `${left.x-this.bleed} ${left.y-height}`
		let leftSideLeftBottom = `${left.x-this.bleed} ${left.y}`
		let leftSideRightBottom = `${bottom.x} ${bottom.y+this.bleed}`
		let leftSideRightTop = `${bottom.x} ${bottom.y+this.bleed-height}`
		let rightSideLeftTop = `${bottom.x} ${bottom.y+this.bleed-height}`
		let rightSideLeftBottom = `${bottom.x} ${bottom.y+this.bleed}`
		let rightSideRightBottom = `${right.x+this.bleed} ${right.y}`
		let rightSideRightTop = `${right.x+this.bleed} ${right.y-height}`

		if (height) {

			pointTop = `${top.x} ${top.y-this.bleed-height}`
			pointLeft = `${left.x-this.bleed} ${left.y-height}`
			pointBottom = `${bottom.x} ${bottom.y+this.bleed-height}`
			pointRight = `${right.x+this.bleed} ${right.y-height}`

			leftSideLeftTop = `${left.x-this.bleed} ${left.y-height}`
			leftSideLeftBottom = `${left.x-this.bleed} ${left.y}`
			leftSideRightBottom = `${bottom.x} ${bottom.y+this.bleed}`
			leftSideRightTop = `${bottom.x} ${bottom.y+this.bleed-height}`

			rightSideLeftTop = `${bottom.x} ${bottom.y+this.bleed-height}`
			rightSideLeftBottom = `${bottom.x} ${bottom.y+this.bleed}`
			rightSideRightBottom = `${right.x+this.bleed} ${right.y}`
			rightSideRightTop = `${right.x+this.bleed} ${right.y-height}`
		}

		let tileColor = this.tileColor.hex()

		var html = `<path fill="${tileColor}"
					d="M${pointLeft} 
					L${pointBottom} 
					L${pointRight} 
					L${pointTop} 
					L${pointLeft} Z" />`

		if (height) {

			html +=	`<path fill="rgb(122, 132, 179)"
					d="M${leftSideRightTop}
					L${leftSideLeftTop}
					L${leftSideLeftBottom}
					L${leftSideRightBottom}
					L${leftSideRightTop} Z" />`

			html +=	`<path fill="rgb(172, 162, 219)"
					d="M${rightSideLeftTop}
					L${rightSideLeftBottom}
					L${rightSideRightBottom}
					L${rightSideRightTop}
					L${rightSideLeftTop} Z" />`
		}

		let coords: Coords = { "top": top, "left": left, "bottom": bottom, "right": right }

		return { html: html, coords: coords }
	}

	createPolygon(mapInfo: MapInfo, xPos: number, yPos: number, height?: number, color?: string): TileTemplate {

		let html = '';
		let noTopEdge = false;
		let noBottomEdge = false;

		if (mapInfo.y > 0 && mapInfo.x > 0) {
			noTopEdge = true;
		}

		if (mapInfo.y < mapInfo.map.length-1 && mapInfo.x < mapInfo.map[0].length-1) {
			noBottomEdge = true;
		}

		console.log(mapInfo);

		// calculate regular tile for average corner heights to base polygon placement on
		const averageHeightTop = (noTopEdge && noBottomEdge) ? (mapInfo.map[ mapInfo.y - 1 ][ mapInfo.x - 1 ].height + height) / 2 : 0;
		const averageHeightLeftTop = noTopEdge ? (mapInfo.map[ mapInfo.y ][ mapInfo.x - 1 ].height + height) / 2 : 0;
		const averageHeightLeft = (noTopEdge && noBottomEdge) ? (mapInfo.map[ mapInfo.y + 1 ][ mapInfo.x - 1 ].height + height) / 2 : 0;
		const averageHeightLeftBottom = noBottomEdge ? (mapInfo.map[ mapInfo.y + 1 ][ mapInfo.x ].height + height) / 2 : 0;
		const averageHeightBottom = noBottomEdge ? (mapInfo.map[ mapInfo.y + 1 ][ mapInfo.x + 1 ].height + height) / 2 : 0;
		const averageHeightRightBottom = noBottomEdge ? (mapInfo.map[ mapInfo.y ][ mapInfo.x + 1 ].height + height) / 2 : 0;
		const averageHeightRight = (noTopEdge && noBottomEdge) ? (mapInfo.map[ mapInfo.y - 1 ][ mapInfo.x + 1 ].height + height) / 2 : 0;
		const averageHeightRightTop = noTopEdge ? (mapInfo.map[ mapInfo.y - 1 ][ mapInfo.x ].height + height) / 2 : 0;

		// calculate regular tile
		const topPoint: Position = { "x": (xPos + this.dimensions.horizontalWidthFromTop), "y": yPos - averageHeightTop }
		const leftPoint: Position = { "x": xPos, "y": (yPos + this.dimensions.verticalHeightFromTop) - averageHeightLeft }
		const bottomPoint: Position = { "x": (xPos + this.dimensions.horizontalWidthFromBottom), "y": (yPos + this.dimensions.totalHeight) - averageHeightBottom }
		const rightPoint: Position = { "x": (xPos + this.dimensions.totalWidth), "y": (yPos + this.dimensions.verticalHeightFromBottom) - averageHeightRight }

		// calculate center of tile
		const centerY = ((leftPoint.y + rightPoint.y) / 2) - height;
		const centerX = (topPoint.x + bottomPoint.x) / 2;
		const centerPoint: Position = { "x": centerX, "y": centerY };

		// calculate edges for all 8 polygons
		const leftTopEdgeY = (leftPoint.y + topPoint.y) / 2;
		const leftTopEdgeX = (leftPoint.x + topPoint.x) / 2;
		const leftTopEdge = { "x": leftTopEdgeX, "y": leftTopEdgeY - averageHeightLeftTop };

		const rightTopEdgeY = (topPoint.y + rightPoint.y) / 2;
		const rightTopEdgeX = (topPoint.x + rightPoint.x) / 2;
		const rightTopEdge = { "x": rightTopEdgeX, "y": rightTopEdgeY - averageHeightRightTop };

		const rightBottomEdgeY = (bottomPoint.y + rightPoint.y) / 2;
		const rightBottomEdgeX = (bottomPoint.x + rightPoint.x) / 2;
		const rightBottomEdge = { "x": rightBottomEdgeX, "y": rightBottomEdgeY - averageHeightRightBottom };

		const leftBottomEdgeY = (leftPoint.y + bottomPoint.y) / 2;
		const leftBottomEdgeX = (leftPoint.x + bottomPoint.x) / 2;
		const leftBottomEdge = { "x": leftBottomEdgeX, "y": leftBottomEdgeY - averageHeightLeftBottom };

		const polygons = [
			[
				topPoint,
				leftTopEdge,
				centerPoint
			],
			[
				leftTopEdge,
				leftPoint,
				centerPoint
			],
			[
				leftPoint,
				leftBottomEdge,
				centerPoint
			],
			[
				leftBottomEdge,
				bottomPoint,
				centerPoint
			],
			[
				centerPoint,
				bottomPoint,
				rightBottomEdge
			],
			[
				centerPoint,
				rightBottomEdge,
				rightPoint
			],
			[
				rightTopEdge,
				centerPoint,
				rightPoint
			],
			[
				topPoint,
				centerPoint,
				rightTopEdge
			]
		];

		// 8 polygons per tile, draw them in a loop
		for (let i = 0; i < polygons.length; i++) {

			html +=	`<path 
						stroke="rgb(10, 10, 10)" 
						stroke-width="1"
						stroke-linecap="round"
						fill="rgb(172, 162, 219)"
					d="M${polygons[i][0].x} ${polygons[i][0].y-height}
					L${polygons[i][1].x} ${polygons[i][1].y-height}
					L${polygons[i][2].x} ${polygons[i][2].y-height}
					L${polygons[i][0].x} ${polygons[i][0].y-height} Z" />`
		}

		let coords: Coords = { "top": topPoint, "left": leftPoint, "bottom": bottomPoint, "right": rightPoint };

		return { html: html, coords: coords }
	}
}

interface MapInfo {
	map: any[],
	x: number,
	y: number
}