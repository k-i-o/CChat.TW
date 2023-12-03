/*

	TeeAssembler 2.0

	Made by: Aleksandar Blazic
	
*/

let linkInput = document.querySelector('.externalSkin'),
loadButton = document.querySelector('.externalSkinButton'),
template = document.querySelector('.template'),
bodyColorInput = document.querySelector('.bodyInput'),
feetColorInput = document.querySelector('.feetInput'),
coloringModeInput = document.querySelector('.coloringModeInput'),
angleInput = document.querySelector('.angleInput'),
currentAngle = document.querySelector('.currentAngle'),
lookAtCursorCheckbox = document.querySelector('#cursorLook'),
templateStyle = document.createElement('style'),
teeStyle = document.createElement('style'),
lastInput,
myTee

const hslToHex = (h,s,l) => {
	h /= 360
	s /= 100
	l /= 100
	let r, g, b

	if (s === 0) {
		r = g = b = l // achromatic
	}
	else {
		const hue2rgb = (p, q, t) => {
			if (t < 0) t += 1
			if (t > 1) t -= 1
			if (t < 1 / 6) return p + (q - p) * 6 * t
			if (t < 1 / 2) return q
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
			return p
		}
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s
		const p = 2 * l - q
		r = hue2rgb(p, q, h + 1 / 3)
		g = hue2rgb(p, q, h)
		b = hue2rgb(p, q, h - 1 / 3)
	}
	const toHex = x => {
		const hex = Math.round(x * 255).toString(16)
		return hex.length === 1 ? "0" + hex : hex
	}
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

let rgbB,hslB,rgbF,hslF

loadButton.addEventListener('click', () => {
	document.querySelectorAll('.optionsWrap')[1].removeAttribute('disabled')
	let teeContainer = document.querySelector('.tee')
	if (bodyColorInput.value !== '' || feetColorInput.value !== '') {
		teeContainer.setAttribute('data-bodycolor', bodyColorInput.value)
		teeContainer.setAttribute('data-feetcolor', feetColorInput.value)
		teeContainer.setAttribute('data-coloringmode', coloringModeInput.value)
	
		rgbB,hslB,rgbF,hslF
		if (coloringModeInput.value === 'code') {
			hslB = codeFormat(bodyColorInput.value)
			rgbB = HSLToRGB(Math.round(hslB[0]),Math.round(hslB[1]),Math.round(hslB[2]))

			hslF = codeFormat(feetColorInput.value)
			rgbF = HSLToRGB(Math.round(hslF[0]),Math.round(hslF[1]),Math.round(hslF[2]))
		}
		else if (coloringModeInput.value === 'rgb') {
			hslB = RGBToHSL(bodyColorInput.value.split(',')[0],bodyColorInput.value.split(',')[1],bodyColorInput.value.split(',')[2])
			rgbB = bodyColorInput.value.split(',')

			hslF = RGBToHSL(feetColorInput.value.split(',')[0],feetColorInput.value.split(',')[1],feetColorInput.value.split(',')[2])
			rgbF = feetColorInput.value.split(',')
		}
		else {
			hslB = bodyColorInput.value.split(',')
			rgbB = HSLToRGB(Math.round(hslB[0]),Math.round(hslB[1]),Math.round(hslB[2]))

			hslF = feetColorInput.value.split(',')
			rgbF = HSLToRGB(Math.round(hslF[0]),Math.round(hslF[1]),Math.round(hslF[2]))
		}
		hexB = hslToHex(hslB[0],hslB[1],hslB[2])
		hexF = hslToHex(hslF[0],hslF[1],hslF[2])

		document.querySelector('.bodyWrap .result').innerHTML = `
			RGB: ${Math.round(rgbB[0])},${Math.round(rgbB[1])},${Math.round(rgbB[2])} <br>
			HSL: ${Math.round(hslB[0])},${Math.round(hslB[1])},${Math.round(hslB[2])} <br>
			Hex: ${hexB}
		`
		document.querySelector('.feetWrap .result').innerHTML = `
			RGB: ${Math.round(rgbF[0])},${Math.round(rgbF[1])},${Math.round(rgbF[2])} <br>
			HSL: ${Math.round(hslF[0])},${Math.round(hslF[1])},${Math.round(hslF[2])} <br>
			Hex: ${hexF}
		`
	}
	else {
		teeContainer.removeAttribute('data-bodycolor')
		teeContainer.removeAttribute('data-feetcolor')
		teeContainer.removeAttribute('data-coloringmode')

		document.querySelector('.bodyWrap .result').innerHTML = ''
		document.querySelector('.feetWrap .result').innerHTML = ''
	}
	myTee = new Tee(linkInput.value)
	myTee.bindContainer(teeContainer)
	currentAngle.value = `~${Math.round(myTee.eyesAngle)}deg`
	if (lastInput !== linkInput.value) {
		templateStyle.innerHTML = `
			.template div {
				background-image: url(${linkInput.value});
				background-size: 256px 128px;
			}`
		document.head.appendChild(templateStyle)
	}
	lastInput = linkInput.value
})

angleInput.addEventListener('input', () => {
	myTee.lookAt(angleInput.value)
	currentAngle.value = `~${Math.round(myTee.eyesAngle)}deg`
})

let mouseMoveFunction = () => {
	let tempAngle
	if (myTee.eyesAngle < 0) {
		tempAngle = myTee.eyesAngle + 360
	}
	else {
		tempAngle = myTee.eyesAngle
	}
	currentAngle.value = `~${Math.round(tempAngle)}deg`
}

lookAtCursorCheckbox.addEventListener('click', () => {
	if (lookAtCursorCheckbox.checked) {
		myTee.lookAtCursor()
		document.addEventListener('mousemove', mouseMoveFunction)
	}
	else {
		myTee.dontLookAtCursor()
		document.removeEventListener('mousemove', mouseMoveFunction)
	}
})