# ShoeShow E-commerce Web Application

ShoeShow is a modern, responsive e-commerce web application for premium footwear, built with Angular 20+ and Angular Material. It features user authentication, product browsing, shopping cart, wishlist, order management, and a mobile-friendly UI.

## Features
- User authentication (login/register)
- Product catalog with filters and details
- Shopping cart and wishlist management
- Order history and user profile
- Responsive design with Angular Material and Bootstrap grid
- Animations and enhanced UX

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Angular CLI](https://angular.dev/tools/cli) (v20+)

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd ShoeShow-frontend-user
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Development server
To start a local development server, run:
```bash
ng serve
```
Open your browser at [http://localhost:4200/](http://localhost:4200/). The app reloads automatically on code changes.

### Building
To build the project for production:
```bash
ng build
```
The build artifacts will be stored in the `dist/` directory.

### Running unit tests
To execute unit tests with [Karma](https://karma-runner.github.io):
```bash
ng test
```

### Running end-to-end tests
For end-to-end (e2e) testing:
```bash
ng e2e
```

## Project Structure
- `src/app/` – Main application code
  - `core/` – Core modules, services, guards, and shared components
  - `features/` – Feature modules (auth, products, cart, wishlist, profile, orders, about, home)
  - `shared/` – Shared directives and utilities
  - `assets/` – Static assets (images, icons)

## Code Scaffolding
To generate a new component:
```bash
ng generate component component-name
```
For a complete list of schematics:
```bash
ng generate --help
```

## Additional Resources
- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [Angular Material](https://material.angular.io/)
- [Bootstrap](https://getbootstrap.com/)

## License
This project is for educational purposes.
