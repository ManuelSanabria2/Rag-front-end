# Project Structure

This project follows a feature-based folder structure for better scalability and maintainability.

## Directory Structure

- `src/`
  - `assets/`: Static assets like images, icons, and fonts.
  - `components/`:
    - `ui/`: Reusable, atomic UI components (e.g., Shadcn UI).
    - `shared/`: Reusable components shared across multiple features.
  - `features/`: Feature-specific modules.
    - `auth/`: Login and authentication logic.
    - `chat/`: Chat con IA module.
    - `documents/`: Búsqueda de documentos and upload panel.
    - `protocols/`: Protocolos y guías management.
    - `favorites/`: User favorites module.
    - `history/`: Query history module.
    - `analytics/`: Analytics and reporting charts.
    - `dashboard/`: Main dashboard shell and layout.
  - `hooks/`: Custom React hooks.
  - `layouts/`: Shared page layouts.
  - `services/`: API calls and external service integrations.
  - `styles/`: Global styles and CSS variables.
  - `types/`: Global TypeScript definitions.
  - `utils/`: Helper functions and utilities.
  - `App.tsx`: Main application component.
  - `main.tsx`: Application entry point.

## Scalability Principles

1. **Feature Encapsulation**: Keep feature-specific logic, components, and hooks within their respective `features/` subfolders.
2. **Atomic UI**: Use `components/ui/` for basic building blocks.
3. **Clear Exports**: Avoid default exports for shared utilities to ensure better IDE support and avoid naming conflicts.
