# Vici Frontend Monorepo

This monorepo contains all frontend code for the Vici application, including web, mobile, and shared packages.

## Project Structure

```
vici-frontend/
├── packages/
│   ├── shared/              # Shared code
│   │   ├── components/      # Common components
│   │   ├── hooks/          # Shared hooks
│   │   ├── services/       # API integration
│   │   └── types/          # Common types
│   ├── web/                # Web-specific code
│   │   ├── pages/
│   │   └── components/
│   └── mobile/             # Mobile-specific code
│       ├── screens/
│       └── native-components/
├── package.json
└── turbo.json             # Monorepo configuration
```

## Getting Started

### Prerequisites

- Node.js 18.0+
- Yarn 1.22+
- Xcode 14.0+ (for iOS development)
- Android Studio (for Android development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/cdunn-dev/vici-frontend.git
cd vici-frontend
```

2. Install dependencies:
```bash
yarn install
```

### Development

Start development servers:

```bash
# Web development
yarn web:dev

# Mobile development
yarn mobile:dev
```

### Building

Build all packages:

```bash
yarn build
```

### Testing

Run tests:

```bash
yarn test
```

### Linting

Run linter:

```bash
yarn lint
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

This project is proprietary and confidential. 