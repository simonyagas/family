# Nueva partida familiar

Web estática interactiva estilo videojuego retro para anunciar una expansión familiar con mellizos.

## Cómo abrirla

Abrí `index.html` directamente en el navegador. No hace falta instalar nada, ejecutar un servidor ni usar herramientas de compilación.

## Reemplazar imágenes

Colocá tus imágenes en `assets/img/` con estos nombres exactos:

- `simon.png`
- `agus.png`
- `alma.png`
- `baby1.png`
- `baby2.png`
- `ultrasound.png`

Si falta alguna imagen, la web muestra un avatar de reemplazo automáticamente.

## Reemplazar sonidos

Colocá tus audios en `assets/audio/` con estos nombres exactos:

- `start.mp3`
- `select.mp3`
- `level-up.mp3`
- `item-found.mp3`
- `glitch.mp3`

El audio se intenta reproducir solo después de una interacción del usuario. Si falta un archivo o el navegador bloquea el audio, la web sigue funcionando y usa un sonido simple generado por JavaScript.

## Publicar en GitHub Pages

1. Subí estos archivos al repositorio:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `assets/`
   - `README.md`
2. En GitHub, entrá en la configuración del repositorio.
3. Abrí la sección de páginas.
4. Elegí publicar desde una rama.
5. Seleccioná la rama principal y la carpeta raíz.
6. Guardá los cambios y esperá a que GitHub genere la dirección pública.

## Personalizar colores

Los colores principales están al inicio de `styles.css`, dentro de `:root`. Cambiá esas variables para ajustar rápidamente el tema visual.
