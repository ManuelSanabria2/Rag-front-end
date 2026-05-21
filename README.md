# Proyecto RAG Front-end

Este proyecto es una interfaz para un sistema RAG (Retrieval-Augmented Generation) que incluye módulos de Chat, Dashboard, Análisis, Documentos y más.

## Requisitos Previos

Asegúrate de tener instalado lo siguiente en tu máquina:

- [Node.js](https://nodejs.org/) (Versión 18 o superior recomendada)
- [pnpm](https://pnpm.io/) (Si no lo tienes, puedes instalarlo con `npm install -g pnpm`)

## Instalación y Configuración

El proyecto utiliza **pnpm** para la gestión de dependencias. Sigue estos pasos para configurar el entorno:

1. **Instalar dependencias:**
   ```bash
   pnpm install --ignore-scripts
   ```
   *Nota: Usamos `--ignore-scripts` para evitar bloqueos interactivos de seguridad de pnpm en ciertos entornos.*

2. **Configuración de seguridad (opcional):**
   El proyecto ya incluye configuración en `package.json` y `.npmrc` para permitir automáticamente los scripts de construcción de `@tailwindcss/oxide` y `esbuild`.

## Ejecución en Desarrollo

Para iniciar el servidor de desarrollo con Vite:

```bash
pnpm dev
```

Una vez iniciado, podrás acceder a la aplicación en: [http://localhost:5173/](http://localhost:5173/)

## Scripts Disponibles

- `pnpm dev`: Inicia el servidor de desarrollo.
- `pnpm build`: Genera el bundle de producción en la carpeta `dist`.
