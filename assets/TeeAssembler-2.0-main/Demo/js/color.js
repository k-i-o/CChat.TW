class Color {
	constructor(r, g, b, a=255) {
		this.r = r
		this.g = g
		this.b = b
		this.a = a
	}
}

const HSLToRGB = (hue, saturation, lightness) => {
	if (hue == undefined) {
		return [0, 0, 0]
	}

	let chroma = (1 - Math.abs(((2 * lightness) / 100) - 1)) * (saturation / 100),
	huePrime = hue / 60,
	secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1)),
	red,green,blue

	huePrime = Math.floor(huePrime)

	if (huePrime === 0) {
		red = chroma
		green = secondComponent
		blue = 0
	}
	else if (huePrime === 1) {
		red = secondComponent
		green = chroma
		blue = 0
	}
	else if (huePrime === 2) {
		red = 0
		green = chroma
		blue = secondComponent
	}
	else if (huePrime === 3) {
		red = 0
		green = secondComponent
		blue = chroma
	}
	else if (huePrime === 4) {
		red = secondComponent
		green = 0
		blue = chroma	
	}
	else if (huePrime === 5) {
		red = chroma
		green = 0
		blue = secondComponent
	}

	let lightnessAdjustment = (lightness / 100) - (chroma / 2)
	red = Math.round((red + lightnessAdjustment) * 255)
	green = Math.round((green + lightnessAdjustment) * 255)
	blue = Math.round((blue + lightnessAdjustment) * 255)

	return [red,green,blue]
}

const RGBToHSL = (r=0, g=0, b=0) => {
	r /= 255
	g /= 255
	b /= 255
	const l = Math.max(r, g, b),
	s = l - Math.min(r, g, b),
	h = s
	? l === r
		? (g - b) / s
		: l === g
		? 2 + (b - r) / s
		: 4 + (r - g) / s
	: 0
	return [
	60 * h < 0 ? 60 * h + 360 : 60 * h,
	100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
	(100 * (2 * l - s)) / 2,
	]
}

const rgbFormat = (color) => {
	const sColor = color.split(',')
	
	if (sColor.length < 3 || sColor.length > 4)
		throw Error('Mininum and maximum elements: 3, 4')

	for (let i=0;i<sColor.length;i++) {
		let value = sColor[i].match(/\d+/)
		if (!value) {
			throw Error(`Invalid RGB color format ${color}\nValid format: \'255, 0, 12\' or \'255, 0, 12, 255\'`)
		}
		value = parseInt(value)
		if (value < 0 || value > 255) {
			throw Error(`RGB color ${value} is not between 0 and 255`)
		}
		sColor[i] = value
	}
	return sColor
}

const hslFormat = (color) => {
	const sColor = color.split(','),
	limits = [360, 100, 100, 255]
	let limit
	
	if (sColor.length < 3 || sColor.length > 4)
		throw Error('Mininum and maximum elements: 3, 4')

	for (let i=0;i<sColor.length;i++) {
		let value = sColor[i].match(/\d+/)
		if (!value) {
			throw Error(`Invalid HSL color format ${color}\nValid format: \'360, 100, 100\' or \'123, 12, 12, 255\'`)
		}
		value = parseInt(value)
		limit = limits[i]
		if (value < 0 || value > limit) {
			throw Error(`RGB color ${value} is not between 0 and ${limit}`)
		}
		sColor[i] = value
	}
	return sColor
}

const isDigit = (str) => {
	for (const char of str) {
		if ('1234567890'.includes(char) == false) {
			return false
		}
	}
	return true
}

const genChunks = (src, size) => {
	let ret = []

	for (let i=0;i<src.length;i += size) {
		ret.push(src.slice(i, i + size))
	}
	return ret
}

// Convert a color code to HSL format
const codeFormat = (color) => {
	if (isDigit(color) == false) {
		throw Error(`Invalid code format ${color}\nValid format: A value encoded on 6 bytes`)
	}

	color = parseInt(color)
	if (color < 0 || color > 0xffffff) {
		throw Error(`Invalid value ${color}\nValid format: an integer (min: 0, max: 0xffffff)`)
	}
	color = color.toString(16)
	const l = color.length
	if (l < 6) {
		color = '0'.repeat(6 - l) + color
	}
	color = genChunks(color, 2).map(x => parseInt(x, 16))
	if (color[0] === 255) {
		color[0] = 0
	}
	color[0] = (color[0] * 360) / 255
	color[1] = (color[1] * 100) / 255
	//color[2] = ((color[2] / 2 + 128) * 100) / 255 - Original code
	color[2] = (((color[2] / 255) / 2) + 0.5) * 100
	return color
}

const COLOR_FORMAT = {
	'rgb': rgbFormat,
	'hsl': hslFormat,
	'code': codeFormat
}

const blackAndWhite = (pixel) => {
	const newValue = (pixel.r + pixel.g + pixel.b) / 3

	pixel.r = newValue
	pixel.g = newValue
	pixel.b = newValue
}

const defaultOp = (pixel, color) => {
	pixel.r = (pixel.r * color.r) / 255
	pixel.g = (pixel.g * color.g) / 255
	pixel.b = (pixel.b * color.b) / 255
	pixel.a = (pixel.a * color.a) / 255
}

const COLOR_MODE = {
	'default': defaultOp,
	'grayscale': blackAndWhite
}
