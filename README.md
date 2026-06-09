# Familia Yagas - Save File 2026

Web estatica interactiva estilo videojuego retro para anunciar una expansion familiar con mellizos.

## Como abrirla

Abre `index.html` directamente en el navegador. No hace falta instalar nada, ejecutar un servidor ni usar build tools.

## Reemplazar imagenes

Coloca tus imagenes en `assets/img/` con estos nombres exactos:

- `simon.png`
- `agus.png`
- `alma.png`
- `baby1.png`
- `baby2.png`
- `ultrasound.png`

Si falta alguna imagen, la web muestra un avatar placeholder automaticamente.

## Reemplazar sonidos

Coloca tus audios en `assets/audio/` con estos nombres exactos:

- `start.mp3`
- `select.mp3`
- `level-up.mp3`
- `glitch.mp3`

El audio se intenta reproducir solo despues de una interaccion del usuario. Si falta un archivo o el navegador bloquea el audio, la web sigue funcionando y usa un sonido simple generado por JavaScript.

## Publicar en GitHub Pages

1. Sube estos archivos al repositorio:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `assets/`
   - `README.md`
2. En GitHub, ve a `Settings` > `Pages`.
3. En `Build and deployment`, elige `Deploy from a branch`.
4. Selecciona la rama principal y la carpeta `/root`.
5. Guarda los cambios y espera a que GitHub genere la URL.

## Personalizar colores

Los colores principales estan al inicio de `styles.css`, dentro de `:root`. Cambia esas variables para ajustar rapidamente el tema visual.
