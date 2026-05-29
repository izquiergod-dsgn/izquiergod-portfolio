# Luis Izquierdo — Portfolio

Stack: **React 19 + Vite + Framer Motion + React Router**  
Inspirado en el sistema P3Menu. CSS separado del JSX.

---

## Inicio rápido

```bash
npm install
npm run dev
```

---

## Estructura

```
src/
├── global.css              ← Variables CSS, reset, estilos globales
├── App.jsx                 ← Rutas + cursor global
├── main.jsx
│
├── data/
│   └── projects.js         ← DATOS de los 6 proyectos (editar aquí)
│
├── components/
│   ├── Menu/
│   │   ├── Menu.jsx        ← Menú principal P3-style (naranja)
│   │   └── Menu.css
│   └── Transition/
│       ├── PageTransition.jsx
│       └── transitions.css
│
└── pages/
    ├── Home/
    │   ├── Home.jsx        ← Pantalla principal con video de fondo
    │   └── Home.css
    ├── Projects/
    │   ├── Projects.jsx    ← Selector P5 de 6 proyectos
    │   └── Projects.css
    ├── About/
    │   ├── About.jsx       ← Barras de personaje con reveal panel
    │   └── About.css
    └── Contact/
        ├── Contact.jsx     ← Menú P5 de contacto sobre rojo
        └── Contact.css
```

---

## Reemplazar imágenes

### Video de fondo (Home)
1. Pon tu video en `src/assets/tu-video.mp4`
2. En `Home.jsx`, descomenta la línea:
   ```jsx
   import menuVideo from '../../assets/tu-video.mp4'
   // y el elemento <video>
   ```

### Imágenes de proyectos (Projects)
En `data/projects.js`, cada proyecto tiene un campo `img` comentado:
```js
// img: './assets/projects/palmas-ilustracion.jpg',
```
1. Pon tus imágenes en `src/assets/projects/`
2. Importa en `Projects.jsx` y pásalas al componente `ProjectImage`
3. Dentro de `ProjectImage`, reemplaza el div placeholder con:
   ```jsx
   <img src={project.img} alt={project.label}
        style={{ width:'100%', height:'100%', objectFit:'cover' }} />
   ```

### Imágenes de personaje (About)
En `About.jsx`, descomenta los imports:
```jsx
import char1 from '../../assets/about/char1.png'
```
Y pasa la imagen como `src` al `<img>` dentro de `.about-portrait-placeholder`.

---

## Personalizar proyectos

Edita `src/data/projects.js` — cada objeto acepta:

| Campo      | Tipo   | Descripción                        |
|------------|--------|------------------------------------|
| `label`    | string | Nombre del proyecto                |
| `type`     | string | Categoría                          |
| `year`     | string | Año                                |
| `tags`     | array  | Etiquetas                          |
| `desc`     | string | Descripción corta                  |
| `acento`   | hex    | Color del proyecto                 |
| `bg`       | hex    | Fondo placeholder (hasta tener img)|
| `fontSize` | number | Tamaño del nombre en el menú       |
| `skew`     | number | Ángulo de inclinación (caos)       |
| `offsetX`  | number | Indent en el menú (escalonado)     |

---

## Agregar páginas de proyecto

Cada proyecto puede tener su propia ruta:
1. Crea `src/pages/projects/PalmasIlustracion/` con su propio JSX + CSS
2. Agrega la ruta en `App.jsx`:
   ```jsx
   <Route path="/projects/palmas-ilustracion" element={...} />
   ```
3. Conecta el botón "VER PROYECTO" en `Projects.jsx` al `href` correcto.

---

## Konami code
↑ ↑ ↓ ↓ ← → ← → B A — desbloquea un side quest.
