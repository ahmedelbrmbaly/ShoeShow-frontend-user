[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/ahmedelbrmbaly/ShoeShow-frontend-user)

# ShoeShow E-commerce Web Application

ShoeShow is a modern, full-featured e-commerce web application for premium footwear, built with Angular 20+ and Angular Material. It offers a seamless shopping experience with advanced AI-powered features, user authentication, product browsing, shopping cart, wishlist, order management, and a mobile-friendly UI.

---

## Table of Contents
- [Features](#features)
- [AI & Model Integration](#ai--model-integration)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development & Build](#development--build)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- User authentication (login/register)
- Product catalog with advanced filters and details
- Shopping cart and wishlist management
- Order history and user profile
- Responsive design (Angular Material + Bootstrap grid)
- Animations and enhanced UX
- Real-time chat support
- AI-powered product recommendations and chat assistant

---

## AI & Model Integration
ShoeShow leverages advanced AI to enhance user experience:
- **AI Chat Assistant:** Real-time support and shopping guidance using a conversational interface.
- **Product Recommendations:** Personalized suggestions based on user behavior and preferences.
- **Model Used:**
  - **meta-llama/llama-4-scout-17b-16e-instruct**
  - Integrated via the backend and exposed through Angular interceptors and services (`groq-api.interceptor.ts`, `chat.service.ts`).
  - Enables natural language understanding for chat and recommendations.

---

## Tech Stack
- **Frontend:** Angular 20+, Angular Material, Bootstrap
- **State Management:** Angular services
- **AI/ML:** Llama 4 Scout 17B (via API)
- **Other:** RxJS, SCSS, TypeScript

---

## Project Structure
```
ShoeShow-frontend-user/
├── src/
│   ├── app/
│   │   ├── core/           # Core services, models, interceptors
│   │   ├── features/       # Feature modules (auth, cart, chat, home, orders, products, profile, wishlist)
│   │   ├── shared/         # Shared directives, animations
│   │   └── app.module.ts   # Main Angular module
│   ├── assets/             # Images and static assets
│   └── environments/       # Environment configs
├── angular.json            # Angular CLI config
├── package.json            # Dependencies
└── README.md               # Project documentation
```

---

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

---

## Development & Build

### Development Server
To start a local development server:
```bash
ng serve
```
Visit [http://localhost:4200/](http://localhost:4200/).

### Production Build
To build the project for production:
```bash
ng build
```
Artifacts are stored in the `dist/` directory.

---

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## License
This project is licensed under the MIT License.

---
