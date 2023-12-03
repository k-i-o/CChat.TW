# TeeAssembler 2.0

TeeAssembler 2.0 is a script used for coloring a TeeWorlds skin image the same way TeeWorlds does and rendering the image in your browser using only CSS and JavaScript.

## Contact

You can contact me on Discord for anything related to the project: Alexander_#6686

---
## License

Copyright (c) 2022 Aleksandar Blažić

Licensed under the [MIT](https://github.com/AlexIsTheGuy/TeeAssembler-2.0/blob/main/LICENSE) license.

---
## Credits

Thanks to [b0th#6474](https://github.com/theobori) for helping me with the project.

Original project: [tw-utils](https://github.com/theobori/tw-utils).

---
## Demo

The Demo website can be viewed at [teeassembler.developer.li](https://teeassembler.developer.li).

---
## Usage

```html
<!DOCTYPE html>
<html>
	<head>

		...

		<link rel='stylesheet' href='css/Tee.css'>

	</head>
	<body>

		...

	</body>

	<script src='js/color.js'></script>
	<script src='js/TeeAssembler.js'></script>
</html>
```

Add the styles in the `<head>` (optional) and the scripts after `<body>`.

### Initialization:

#### Manual Rendering

```html
<div class='tee'></div>
```

Note: No HTML is needed if we don't want to render the tee.

```js
const myTeeContainer = document.querySelector('.tee')
const myTee = new Tee('https://api.skins.tw/database/skins/whis.png', myTeeContainer)
```

Note: `myTeeContainer` can be omitted if we don't want to render the tee and can be added later.

##### Automatic Rendering (No coloring)

```html
<div class='tee' data-skinimage='https://api.skins.tw/api/resolve/skins/mouse'></div>
```

##### Automatic Rendering (With coloring)

```html
<div class='tee' data-skinimage='https://api.skins.tw/api/resolve/skins/mouse' data-bodycolor='13149440' data-feetcolor='255' data-coloringmode='code'></div>
```

Note: When using automatic rendering, the element will be given a random id attribute which can be used to reference the `Tee()` class using `teeArray.find(el => el.randomID === teeIDsArray[0])`

---
### Functions:

#### Retreive (colored) Base64 image:

```js
// getTeeImage(player_color_body, player_color_feet, coloring_mode)

await myTee.getTeeImage() //  same image in Base64
await myTee.getTeeImage('255','13149440','code')
await myTee.getTeeImage('229, 99, 153','255, 255, 255','rgb')
await myTee.getTeeImage('335, 71, 64','0, 0, 100','hsl')
```

---
#### Bind container:

```js
const myTeeContainer = document.querySelector('.tee')
myTee.bindContainer(myTeeContainer)
```

---
#### Unbind container:

```js
myTee.unbindContainer()
```

Note: If we want to move the tee from one container to another we have to unbind the container first and then bind to another.

---
#### Get resolution multiplier:

```js
myTee.getMultiplier()
```

---
#### Make the Tee look at the cursor:

```js
myTee.lookAtCursor()
```

---
#### Make the Tee stop looking at the cursor:

```js
myTee.dontLookAtCursor()
```

---
#### Make the Tee look at an angle (degrees):

```js
myTee.lookAt(0) 	// Right
myTee.lookAt(90) 	// Down
myTee.lookAt(180) 	// Left
myTee.lookAt(270) 	// Up
```

- If you want the tee to look right, the degrees can be omitted. `myTee.lookAt()`
- The function supports degrees above 360. `myTee.lookAt(1254)`

---
### Properties:

```js
teeArray		// (Array) Array of loaded Tee classes
teeIDsArray		// (Array) Array of random IDs from Tee classes

myTee.container		// (HTMLElement) Container for tee render
myTee.randomID		// (String) random ID of Tee

myTee.canvas		// (HTMLElement) Canvas element for (colored) tee image
myTee.ctx			// (CanvasRenderingContext2D) Canvas context
myTee.elements		// (Object) Tee body parts and their canvas elements

myTee.image			// (HTMLElement) Image element of the original image
myTee.imageLink		// (String) Original image URL
myTee.imageResult	// (String) Base64 (colored) image 

myTee.bodyColor		// (String) Color of tee body ('none' if not colored)
myTee.feetColor		// (String) Color of tee feet ('none' if not colored)
myTee.coloringMode	// (String) Coloring mode ('code', 'rgb', 'hsl')
myTee.eyesAngle		// (String) Angle of eyes from center of the tee in degrees
```

---

## Known issues

- Eyes are not perfectly aligned like in the game but it's close enough.
