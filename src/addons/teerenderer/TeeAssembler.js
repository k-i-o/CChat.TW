const SKIN = {
	'size': {
		'width': 256,
		'height': 128
	},
	'elements': {
		'body': [0, 0, 96, 96],
		'body_shadow': [96, 0, 96, 96],
		'hand': [192, 0, 32, 32],
		'hand_shadow': [224, 0, 32, 32],
		'foot': [192, 32, 64, 32],
		'foot_shadow': [192, 64, 64, 32],
		'credits': [0, 96, 64, 32],
		'default_eye': [64, 96, 32, 32],
		'angry_eye': [96, 96, 32, 32],
		'blink_eye': [128, 96, 32, 32],
		'happy_eye': [160, 96, 32, 32],
		'cross_eye': [192, 96, 32, 32],
		'surprised_eye': [224, 96, 32, 32]
	}
}

const genRandomID = (len=16) => {
    charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    let randomString = ''
    for (let i=0;i<len;i++) {
        let randomPos = Math.floor(Math.random() * charSet.length)
        randomString += charSet.substring(randomPos,randomPos+1)
    }
    return randomString
}

const setContainer = (_this, container) => {
	if (container instanceof HTMLElement) {
		_this.container = container
		_this.container.id = _this.randomID

		_this.container.innerHTML = `
			<div class='line'>
				<div class='marker'></div>
			</div>

			<div class='body_shadow' body-part></div>

			<div class='back_foot_shadow' body-part></div>
			<div class='back_foot' body-part></div>

			<div class='body' body-part></div>

			<div class='eyes'>
				<div class='lEye' body-part></div>
				<div class='rEye' body-part></div>
			</div>

			<div class='front_foot_shadow' body-part></div>
			<div class='front_foot' body-part></div>`

		;(async () => {
			let style = document.createElement('style')
			if (_this.container.getAttribute('data-bodycolor') !== null && _this.container.getAttribute('data-feetcolor') !== null) {
				await _this.getTeeImage(_this.container.getAttribute('data-bodycolor'), _this.container.getAttribute('data-feetcolor'), _this.container.getAttribute('data-coloringmode'))
			}
			else {
				await _this.getTeeImage()
			}
			style.innerHTML = `
				#${_this.randomID}.tee div[body-part] {
					background-image: url(${_this.imageResult});
					background-size: 256em 128em;
				}`
			let tempStyle = document.querySelector(`#${_this.randomID}.tee style`)
			if (tempStyle) {
				tempStyle.remove()
			}
			_this.container.appendChild(style)
		})()
		_this.lookAt(_this.eyesAngle)
	}
	else {
		throw Error(`Invalid element: container is not of type HTMLElement`)
	}
}

const teeArray = [],
teeIDsArray = []

class Tee {
	constructor(imageLink, container) {
		teeArray.push(this)
		this.canvas = document.createElement('canvas')
		this.ctx = this.canvas.getContext('2d', {willReadFrequently: true})
		this.elements = new Object()
		this.image = new Image()
		this.image.crossOrigin = ''
		this.imageLink = imageLink
		this.teeEyesVariables = false
		this.eyesAngle = 0

		let getID = () => {
			let tempID = genRandomID()
			if (teeIDsArray.includes(tempID)) {
				getID()
			}
			else {
				this.randomID = tempID
			}
		}

		getID()
		teeIDsArray.push(this.randomID)
		if (container) {
			setContainer(this, container)
		}
	}
	async loadImage(imageLink) {
		this.image.src = imageLink
		await this.image.decode()
		this.canvas.width = this.image.width
		this.canvas.height = this.image.height
		this.canvas.style.width = '256px'
		this.canvas.style.height = '128px'
		this.ctx.drawImage(this.image,0,0,this.canvas.width,this.canvas.height)
	}
	isRatioLegal = () => {
		const ratio = SKIN.size.width / SKIN.size.height
		return this.image.width / this.image.height === ratio
	}
	getMultiplier = () => {
		return this.image.width / SKIN.size.width
	}
	setColor(color, mode) {
		let buffer = this.currentImgData.data,
		r, g, b, a, byte

		// Apply color on every pixel of the img
		for (byte=0;byte<buffer.length;byte+=4) {
			// Get pixel
			r = buffer[byte]
			g = buffer[byte + 1]
			b = buffer[byte + 2]
			a = buffer[byte + 3]

			// Overwriting the pixel
			let pixel = new Color(r, g, b, a)
			COLOR_MODE[mode](pixel, color)

			// Replace the pixel in the buffer
			buffer[byte] = pixel.r
			buffer[byte + 1] = pixel.g
			buffer[byte + 2] = pixel.b
			buffer[byte + 3] = pixel.a
		}
		this.someImgData = buffer

		this.setCanvas()
	}
	reorderBody() {
		// For the tee body
		// Reorder that the average grey is 192,192,192
		// https://github.com/ddnet/ddnet/blob/master/src/game/client/components/skins.cpp#L227-L263

		let frequencies = Array(256).fill(0),
		orgWeight = 0,
		buffer = this.currentImgData.data,
		byte

		const newWeight = 192,
		invOrgWeight = 255 - orgWeight,
		invNewWeight = 255 - newWeight

		// Find the most common frequence
		for (byte=0;byte<buffer.length;byte+=4)
			if (buffer[byte + 3] > 128) {
				frequencies[buffer[byte]]++
			}

		for (let i=1;i<256;i++)
			if (frequencies[orgWeight] < frequencies[i]) {
				orgWeight = i
			}

		for (byte=0;byte<buffer.length;byte+=4) {
			let value = buffer[byte]

			if (value <= orgWeight && orgWeight == 0) {
				continue
			}
			else if (value <= orgWeight) {
				value = Math.trunc(((value / orgWeight) * newWeight))
			}
			else if (invOrgWeight == 0) {
				value = newWeight
			}
			else {
				value = Math.trunc((((value - orgWeight) / 
				invOrgWeight) * invNewWeight + newWeight))
			}

			buffer[byte] = value
			buffer[byte + 1] = value
			buffer[byte + 2] = value

		}
		this.someImgData = buffer

		this.setCanvas()
	}
	setCanvas() {
		this.currentCtx.putImageData(new ImageData(this.someImgData,this.d[2],this.d[3]),0,0)
	}
	isRatioLegal() {
		const ratio = SKIN.size.width / SKIN.size.height
		return this.image.width / this.image.height === ratio
	}
	getMultiplier() {
		return this.image.width / SKIN.size.width
	}
	getColorArg(color, standard) {
		if (Object.keys(COLOR_FORMAT).includes(standard) == false) {
			throw Error(`Invalid color format: ${standard}\nValid formats: rgb, hsl, code`)
		}
		color = COLOR_FORMAT[standard](color)
		return color
	}
	colorLimitForSkin(color, limit = 52.5) {	
		if (color[2] < limit) {
			color[2] = limit
		}
		return color
	}
	colorConvert(color, standard) {
		color = this.getColorArg(color, standard)

		if (standard == 'rgb') {
			color = RGBToHSL(color[0],color[1],color[2])
		}
		// Preventing full black or full white skins
		color = this.colorLimitForSkin(color)

		// Convert to RGB to apply the color
		color = HSLToRGB(color[0],color[1],color[2])

		return new Color(...color)
	}
	setColor2(color, standard) {
		color = this.colorConvert(color, standard)
		this.setColor(color, 'grayscale')
		if (this.isBody) {
			this.reorderBody()
		}
		this.setColor(color, 'default')
	}
	async getTeeImage(player_color_body='none', player_color_feet='none', coloring_mode='code') {
		await this.loadImage(this.imageLink)
		player_color_body = player_color_body.toString()
		player_color_feet = player_color_feet.toString()
		let body_parts = Object.keys(SKIN.elements)
		if (this.isRatioLegal()) {
			for (let part in body_parts) {
				let currentPart = body_parts[part]

				this.elements[currentPart] = document.createElement('canvas')
				let tempCanvas = this.elements[currentPart]

				let multiplier = this.getMultiplier()
				this.d = SKIN.elements[currentPart].map(x => x * multiplier)

				tempCanvas.width = this.d[2]
				tempCanvas.height = this.d[3]

				this.currentCtx = tempCanvas.getContext('2d', {
					willReadFrequently: true
				})

				this.currentCtx.putImageData(this.ctx.getImageData(this.d[0],this.d[1],this.d[2],this.d[3]),0,0)
				if (body_parts[part] === 'body') {
					this.isBody = true
				}
				else {
					this.isBody = false
				}
				this.currentImgData = this.currentCtx.getImageData(0,0,this.d[2],this.d[3])
				
				if (player_color_body !== 'none' && player_color_feet !== 'none') {
					if (currentPart.includes('foot')) {
						this.setColor2(player_color_feet, coloring_mode)
					}
					else if (!currentPart.includes('credits')) {
						this.setColor2(player_color_body, coloring_mode)
					}
				}

				if (Object.keys(SKIN.elements)[body_parts.length-1] === currentPart) {
					this.ctx.clearRect(0,0,this.ctx.width,this.ctx.height)
					for (let i=0;i<Object.keys(SKIN.elements).length;i++) {
						let e = SKIN.elements[Object.keys(this.elements)[i]].map(x => x * multiplier)
						this.ctx.drawImage(this.elements[Object.keys(this.elements)[i]],e[0],e[1])
						if (i === Object.keys(SKIN.elements).length-1) {
							this.imageResult = this.canvas.toDataURL()
							this.bodyColor = player_color_body
							this.feetColor = player_color_feet
							this.coloringMode = coloring_mode
							return this.imageResult
						}
					}
				}
			}
		}
		else {
			throw Error('Image has wrong ratio.')
		}
	}
	bindContainer(container) {
		setContainer(this, container)
	}
	unbindContainer() {
		this.container.removeAttribute('id')
		this.container = undefined
	}
	teeEyesTranslateFunction() {
		this.markerCoord = {
			x: this.marker.getBoundingClientRect().x,
			y: this.marker.getBoundingClientRect().y
		}
		this.scale = this.container.getBoundingClientRect().width / this.container.offsetWidth
		this.teeEyes.style.transform = `translate(${(this.markerCoord.x - this.container.getBoundingClientRect().x) / this.scale}px, ${(this.markerCoord.y - this.container.getBoundingClientRect().y) / this.scale}px)`
	}
	setTeeEyesVariables() {
		this.teeEyesVariables = true

		this.line = document.querySelector(`#${this.randomID}.tee .line`)
		this.marker = document.querySelector(`#${this.randomID}.tee .marker`)
		this.teeEyes = document.querySelector(`#${this.randomID}.tee .eyes`)
	}
	lookAtCursor() {
		this.setTeeEyesVariables()
		let originCoord = {
			x: this.line.getBoundingClientRect().x.toFixed(),
			y: this.line.getBoundingClientRect().y.toFixed()
		}

		this.moveTeeEyesFunction = (e) => {
			this.eyesAngle = Math.atan2(e.clientY - originCoord.y, e.clientX - originCoord.x) * 180 / Math.PI
			this.line.style.transform = `translate(-1em, .5em) rotate(${this.eyesAngle}deg)`
			this.teeEyesTranslateFunction()
		}

		this.eyeMoveEvent = document.addEventListener('mousemove', this.moveTeeEyesFunction) 
	}
	dontLookAtCursor() {
		document.removeEventListener('mousemove', this.moveTeeEyesFunction)
	}
	lookAt(deg=0) {
		this.eyesAngle = deg
		this.setTeeEyesVariables()
		this.line.style.transform = `translate(-1em, .5em) rotate(${deg}deg)`

		this.teeEyesTranslateFunction()
	}
}

document.querySelectorAll('.tee[data-skinimage]').forEach(el => {
	new Tee(el.getAttribute('data-skinimage'), el)
})