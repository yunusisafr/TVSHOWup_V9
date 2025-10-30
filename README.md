# TVSHOWup

A modern, multi-language streaming content discovery platform that helps users find movies and TV shows across different streaming platforms with intelligent recommendations and social features.

## Features

### Content Discovery
- **Smart Search**: Advanced search functionality with filters for genres, platforms, and content types
- **AI-Powered Recommendations**: Intelligent content discovery using AI-driven chat interface
- **Discovery Wizard**: Interactive wizard to help users find content based on mood, preferences, and viewing habits
- **Swipe Discovery**: Tinder-style interface for discovering new content
- **Trending Content**: Automated import and display of trending movies and TV shows

### Multi-Language Support
- **9 Languages**: Full support for English, Turkish, German, French, Spanish, Italian, Portuguese, Japanese, Korean, and Arabic
- **RTL Support**: Right-to-left layout support for Arabic
- **Automatic Translation Sync**: Backend services to sync content translations from TMDB
- **Localized UI**: Complete interface translation with language-specific routing

### Streaming Platform Integration
- **Provider Tracking**: Integration with 100+ streaming platforms worldwide
- **Country-Specific Availability**: Shows which platforms stream content in user's region
- **Network Information**: Display original broadcast networks for TV shows
- **Turkish Platform Support**: Special support for Turkish streaming services (GAİN, BluTV, etc.)

### User Features
- **Personal Watchlists**: Create and manage multiple custom watchlists
- **Public Lists**: Share watchlists publicly with SEO-friendly URLs
- **List Discovery**: Explore and clone public lists from other users
- **Content Rating**: Rate movies and TV shows
- **User Badges**: Gamification with achievement badges
- **Social Following**: Follow other users and discover their lists
- **Export Functionality**: Export watchlists to various formats

### SEO & Performance
- **Dynamic Sitemaps**: Automatic sitemap generation for all content
- **Structured Data**: Schema.org markup for rich search results
- **Pre-rendering**: Netlify pre-rendering for critical pages
- **Multi-language SEO**: Hreflang tags for international search optimization
- **Fast Loading**: Optimized with lazy loading and intersection observers
- **Progressive Web App**: PWA capabilities with service worker

### Admin Dashboard
- **Content Management**: Admin interface for managing content
- **User Management**: User account administration
- **Static Pages**: Create and edit static pages with markdown support
- **Translation Management**: Sync and manage content translations
- **Analytics Dashboard**: Track user engagement and platform statistics

## Tech Stack

### Frontend
- **React 18.3**: Modern React with hooks
- **TypeScript**: Type-safe development
- **React Router**: Client-side routing with language support
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast build tool and dev server
- **Lucide React**: Icon library

### Backend & Database
- **Supabase**: Backend-as-a-Service
  - PostgreSQL database
  - Authentication & authorization
  - Row Level Security (RLS)
  - Edge Functions
  - Real-time subscriptions

### External APIs
- **TMDB API**: Movie and TV show data
- **OpenAI**: AI-powered content discovery chat

### Edge Functions
- `ai-discover-content`: AI chat for content recommendations
- `sync-tmdb-data`: Import content from TMDB
- `sync-content-translations`: Sync multi-language translations
- `sync-content-providers`: Update streaming platform availability
- `sync-watch-providers`: Alternative provider sync method
- `import-trending-content`: Import trending content automatically
- `generate-sitemaps`: Generate XML sitemaps for SEO
- `sync-all-translations`: Batch translation updates

### Deployment
- **Netlify**: Hosting and continuous deployment
- **Netlify Edge Functions**: Serverless API routes
- **Netlify Plugins**: Sitemap generation and pre-rendering

## Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── admin/          # Admin dashboard components
│   │   ├── AdBanner.tsx
│   │   ├── ContentCard.tsx
│   │   ├── Header.tsx
│   │   └── ...
│   ├── contexts/           # React contexts for global state
│   │   ├── AuthContext.tsx
│   │   ├── AdminContext.tsx
│   │   └── UserPreferencesContext.tsx
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin pages
│   │   ├── HomePage.tsx
│   │   ├── ContentDetailPage.tsx
│   │   └── ...
│   ├── lib/                # Utility libraries
│   │   ├── supabase.ts     # Supabase client
│   │   ├── tmdb.ts         # TMDB API integration
│   │   ├── database.ts     # Database operations
│   │   ├── i18n.ts         # Internationalization
│   │   └── ...
│   └── App.tsx             # Root component
├── supabase/
│   ├── functions/          # Edge functions
│   └── migrations/         # Database migrations
├── public/                 # Static assets
├── scripts/                # Build and utility scripts
└── package.json
```

## Architecture

### Multi-Language System
The application uses a sophisticated multi-language architecture:

1. **Country Code**: Determines streaming provider availability (TR, US, DE, etc.)
2. **Language Code**: Controls UI and content translation (tr, en, de, etc.)
3. **Translation Storage**: All translations stored in JSONB columns in the database
4. **Slug System**: Single canonical slug per content based on original title
5. **No Runtime API Calls**: All translations pre-fetched and stored in database

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed information.

### Database Schema
Key tables:
- `tv_shows`: TV show content with multi-language support
- `movies`: Movie content with multi-language support
- `providers`: Streaming platforms and networks
- `content_providers`: Content-to-provider relationships
- `user_profiles`: Extended user information
- `user_watchlist`: User's saved content
- `user_lists`: Custom user lists
- `user_list_items`: Items in custom lists
- `content_ratings`: User ratings
- `user_badges`: Achievement system
- `user_follows`: Social following
- `ai_discovery_sessions`: AI chat sessions
- `ai_chat_rate_limits`: Rate limiting for AI features
- `analytics_events`: User interaction tracking
- `contact_messages`: Contact form submissions
- `ad_units`: Advertisement management

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- TMDB API key
- OpenAI API key (for AI features)

### Environment Variables
Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tvshowup-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
# Run migrations to set up database schema
# Migrations are in supabase/migrations/
```

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run generate-slugs` - Generate content slugs
- `npm run migrate-multilingual` - Migrate to multi-language schema
- `npm run check-translations` - Check translation status
- `npm run translate-lists` - Translate user lists

## SEO Implementation

The application includes comprehensive SEO features:

- **robots.txt**: Crawling rules for search engines
- **Dynamic XML Sitemaps**: Auto-generated sitemaps for all content
- **Structured Data**: Schema.org JSON-LD for rich snippets
- **Meta Tags**: Dynamic page-specific meta tags
- **Open Graph**: Social media sharing optimization
- **Hreflang Tags**: International SEO for multi-language content
- **Pre-rendering**: Critical pages pre-rendered for fast indexing

See [SEO_IMPLEMENTATION.md](./SEO_IMPLEMENTATION.md) for details.

## Key Features Implementation

### Content Discovery Algorithm
The discovery algorithm considers:
- User's watch history
- Ratings and preferences
- Mood and genre preferences
- Similar users' preferences
- Trending content
- Streaming platform availability

### AI Chat Discovery
- Natural language content search
- Context-aware recommendations
- Conversation history
- Rate limiting and feedback system

### Social Features
- Public watchlist sharing
- User following system
- List discovery and cloning
- Community content curation

### Analytics
- Page view tracking
- Content interaction tracking
- Search analytics
- User engagement metrics

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Lazy loading for images and components
- Intersection Observer for infinite scroll
- Database query optimization
- Edge function caching
- CDN for static assets
- Service worker for offline support

## Security

- Supabase Row Level Security (RLS)
- Authentication with JWT
- Rate limiting for API endpoints
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is proprietary and confidential.

## Support

For issues and questions, use the contact form in the application or reach out to the development team.

## Acknowledgments

- **TMDB**: The Movie Database for content data
- **Supabase**: Backend infrastructure
- **Netlify**: Hosting and deployment
- **React Team**: React framework
- **Tailwind CSS**: UI styling framework
