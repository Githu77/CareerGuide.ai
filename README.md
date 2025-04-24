# CareerGuide Kenya

CareerGuide is a modern web application that helps job seekers in Kenya discover personalized job opportunities and professional development courses based on their skills and location.

## Features

- **Personalized Job Recommendations**: Get job matches based on your unique skills and experience
- **Skill-Building Courses**: Discover relevant courses to develop your professional capabilities
- **Location-Based Matching**: Find opportunities relevant to your location in Kenya
- **Offline Support**: Access basic features even without an internet connection
- **Modern UI**: Clean, responsive design with dark mode support
- **AI-Powered Recommendations**: Smart matching using DeepSeek AI

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: React Hooks
- **Authentication**: Supabase
- **AI Integration**: DeepSeek API
- **Offline Support**: Service Workers, PWA

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- DeepSeek API key (for AI recommendations)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/careerguide.git
cd careerguide
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
DEEPSEEK_API=your_deepseek_api_key
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
careerguide/
├── app/                # Next.js app directory
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   └── ...            # Feature-specific components
├── lib/               # Utility functions and configurations
├── public/            # Static assets
└── ...                # Configuration files
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [DeepSeek](https://deepseek.com/)
- [Supabase](https://supabase.com/)

## Support

For support, please open an issue in the GitHub repository or contact the maintainers. 