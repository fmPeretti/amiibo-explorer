# Amiibo Explorer
https://www.amiiboexplorer.com

A web app to generate printable amiibo coin and card templates from amiibo lists.

##Why?
I wanted to make some amiibo coins for my fiancée so she could invite villagers to her little ACNH Island and needed to generate some artwork... And so after an hour of fighting with Canva and Adobe (spooky software) I thought to my self *´im a dev not a graphic designer...´* So instead of manually positioning images like a normal person would do, I figured it would be easier to just automate the whole thing. (going from a couple hours task to a weekend task, but hey!!! Someone else can maybe use it now, we have to think about the net positive!! doubt no one will ever use it tho but *"I can dream harold"*)

With this app you can browse the complete amiibo catalog, create custom lists, and generate print-ready PDF templates for coins or cards. You can adjust image positions, set custom dimensions, add back designs, and export everything ready for printing.

Built this in a weekend, so I know for a fact there's infinite room for improvements and new features. Feel free to open any issue or PR and I'll review and merge it!

## Features

- **Explore Amiibos** - Search and filter through the complete amiibo collection
- **Custom Lists** - Create and manage your own amiibo lists
- **Template Generator** - Generate printable templates with customizable settings:
  - Coin templates (circular) or Card templates (rectangular)
  - Multiple page sizes (A4, Letter, etc.)
  - Adjustable dimensions, margins, and spacing
  - Per-amiibo image adjustments (zoom, position)
  - Custom back designs per series
  - PDF export for printing
- **Community Templates** - Pre-made templates to get you started quickly
- **Guides** - Tutorials and resources for making your own amiibo coins/cards

## Getting Started (local setup)

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/fmPeretti/amiibo-explorer.git
cd amiibo-explorer

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Tech Stack

- [Next.js 16](https://nextjs.org/) - React framework
- [React 19](https://react.dev/) - UI library
- [Tailwind CSS 4](https://tailwindcss.com/) - Styling
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation
- [AmiiboAPI](https://www.amiiboapi.org/) - Amiibo data

## Thanks to AmiiboAPI

This app relies entirely on [AmiiboAPI](https://www.amiiboapi.org/) - a free, open-source RESTful API that provides all the amiibo data and images.

If you like this app, please go support them! They're providing this service for free and it's what makes this project possible.

If they ever stop hosting the API, I might continue hosting it myself for a while because I really like the project.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Home page
│   ├── explore/           # Amiibo browser
│   ├── lists/             # Custom lists management
│   ├── templates/         # Template generator & saved templates
│   └── guides/            # Tutorials and resources
├── components/            # React components
│   ├── Header.tsx         # Navigation header
│   ├── AmiiboCard.tsx     # Amiibo display card
│   └── TemplateGenerator.tsx  # Main template editor
├── lib/                   # Utilities and helpers
│   ├── amiibo-api.ts      # AmiiboAPI client
│   ├── template-storage.ts # LocalStorage management
│   └── community-templates.ts # Pre-made templates
└── contexts/              # React contexts
    └── ApiStatusContext.tsx # API health monitoring
```

## How It Works

1. **Browse** - Use the Explore page to search amiibos by name, type, or series
2. **Collect** - Add amiibos to custom lists
3. **Design** - Open the Template Generator from your list or the Templates page
4. **Customize** - Adjust dimensions, spacing, zoom, and add back designs
5. **Export** - Generate a PDF ready for printing

## Contributing

1. Open an issue describing the bug or feature
2. Fork the repo and create a branch
3. Make your changes
4. Open a PR and I'll review it

## License

MIT - Do whatever you want with it!

*Best regards!!*
*F.P.*