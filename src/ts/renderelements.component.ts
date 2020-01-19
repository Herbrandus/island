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
}