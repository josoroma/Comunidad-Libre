<p align="center">
  <img src="assets/logo.svg" width="112" height="112" alt="Comunidad Libre">
</p>

<h1 align="center">Comunidad Libre</h1>

<p align="center">
  Una biblioteca para entender la libertad, la propiedad y la cooperación voluntaria.
</p>

<p align="center">
  <a href="https://josoroma.github.io/Comunidad-Libre/">Explorar el sitio</a> ·
  <a href="output/pdf/comunidad-libre.pdf">Leer el libro</a> ·
  <a href="libro/comunidad-libre.md">Abrir el manuscrito</a>
</p>

## Las ideas necesitan un recorrido

Acercarse al pensamiento libertario puede significar saltar entre textos dispersos, citas sin contexto y discusiones que confunden autores distintos. Encontrar una posición es fácil. Entender sus fundamentos, objeciones y consecuencias exige más.

Comunidad Libre reúne lectura, conversación y referencias en un solo proyecto. Está pensado para quien quiere estudiar estas ideas, contrastarlas y formar su propio criterio.

## Un libro. Ocho conversaciones. Fuentes para profundizar.

| Contenido | Qué encuentras |
| --- | --- |
| **46 páginas** | Un libro con prólogo y ocho capítulos, preparado para leer y descargar. |
| **23 referencias comentadas** | Autores, obras y diferencias doctrinales explicadas. |
| **8 episodios completos** | Conversaciones en español de Costa Rica, con audio descargable. |
| **Transcripción sincronizada** | Sigue cada intervención y salta al momento que quieres escuchar. |

El libro, *La cooperación humana frente al monopolio del poder*, desarrolla una orientación libertaria centrada en el consentimiento y la cooperación voluntaria. Examina propiedad legítima, comunidad, justicia y una posible transición para Costa Rica.

Los episodios conservan la formulación original sobre Estado limitado y municipalismo. **Son el punto de partida del libro, no su audiolibro.** Esa diferencia permite seguir la evolución del proyecto.

## Empieza por la pregunta que te importa

- **Quiero comprender el argumento:** [lee el PDF](output/pdf/comunidad-libre.pdf).
- **Prefiero escuchar:** [abre el reproductor](https://josoroma.github.io/Comunidad-Libre/#escuchar).
- **Quiero contrastar las fuentes:** [consulta la revisión de autores y referencias](libro/revision-autores-y-referencias.md).
- **Quiero trabajar con el texto:** [abre el manuscrito editable](libro/comunidad-libre.md).

Las propuestas para Costa Rica son filosóficas e institucionales; el libro no pretende describir la legislación vigente. Las diferencias con otros autores y los problemas pendientes forman parte de la lectura.

## Escucha los ocho episodios

1. [Libertad encarnada](audio/01-libertad-encarnada.mp3)
2. [La persona real](audio/02-la-persona-real.mp3)
3. [Comunidad sin colectivismo](audio/03-comunidad-sin-colectivismo.mp3)
4. [Estado pequeño, municipios fuertes](audio/04-estado-pequeno-municipios-fuertes.mp3)
5. [Economía de propietarios](audio/05-economia-de-propietarios.mp3)
6. [Constitución antitiránica](audio/06-constitucion-antitiranica.mp3)
7. [Programa para Costa Rica](audio/07-programa-para-costa-rica.mp3)
8. [Críticas y manifiesto](audio/08-criticas-y-manifiesto.mp3)

## Ejecuta el sitio en tu equipo

Desde la raíz del repositorio, con Python instalado:

```sh
python3 -m http.server 8765
```

Abre [localhost:8765](http://localhost:8765). El sitio es estático y no necesita una compilación.

Para regenerar el PDF desde el manuscrito, con [uv](https://docs.astral.sh/uv/) instalado:

```sh
uv run --with reportlab --with markdown-it-py python libro/generar_pdf.py
```

El generador utiliza Georgia y Arial en macOS, o DejaVu Serif y DejaVu Sans en Linux.

## Dentro del repositorio

```text
index.html                             Sitio y reproductor
assets/logo.svg                        Identidad visual
assets/site.css                        Estilos del sitio
assets/player.js                       Reproductor y transcripción sincronizada
assets/theme.js                        Preferencia de tema claro u oscuro
assets/illustrations.js                 Ilustraciones de las secciones
assets/vendor/hairline.js               Biblioteca de dibujo SVG
audio/*.mp3                            Ocho episodios completos
transcripts/*.vtt                       Transcripciones sincronizadas
libro/comunidad-libre.md                Manuscrito canónico
libro/revision-autores-y-referencias.md  Revisión editorial y bibliográfica
libro/generar_pdf.py                    Generador del libro
output/pdf/comunidad-libre.pdf          Edición de lectura
```

## Origen y créditos

El podcast identifica como fuente doctrinal el corpus `data/case/comunidad-libre` del proyecto Hermes Legal. El libro se desarrolló a partir de las ocho transcripciones de este repositorio y las fuentes identificadas en su bibliografía. Edición del 29 de octubre de 2026.

Las ilustraciones del sitio utilizan [Hairline](https://hairline.lucasmarkes.com/), de Lucas Marques, versión 0.5.1, distribuida bajo licencia MIT. Ese crédito corresponde a la biblioteca de dibujo.
