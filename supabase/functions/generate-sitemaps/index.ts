import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
}

const SUPPORTED_LANGUAGES = ['en', 'tr', 'de', 'fr', 'es', 'it', 'pt', 'ru', 'ja', 'ko', 'zh']
const BASE_URL = 'https://www.tvshowup.com'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/original'
const MAX_URLS_PER_SITEMAP = 50000

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  alternates?: Array<{ hreflang: string; href: string }>
  images?: Array<{ loc: string; title?: string; caption?: string }>
}

interface Movie {
  id: number
  slug: string
  title: string
  original_title: string
  popularity: number
  vote_average: number
  release_date: string
  updated_at: string
  poster_path: string
  backdrop_path: string
}

interface TVShow {
  id: number
  slug: string
  name: string
  original_name: string
  popularity: number
  vote_average: number
  first_air_date: string
  in_production: boolean
  updated_at: string
  poster_path: string
  backdrop_path: string
}

interface Person {
  id: number
  name: string
  profile_path: string
  popularity: number
  known_for_department: string
}

function escapeXml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function generateXmlUrl(url: SitemapUrl): string {
  let xml = `  <url>\n`
  xml += `    <loc>${escapeXml(url.loc)}</loc>\n`

  if (url.lastmod) {
    xml += `    <lastmod>${url.lastmod}</lastmod>\n`
  }

  if (url.changefreq) {
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`
  }

  if (url.priority !== undefined) {
    xml += `    <priority>${url.priority.toFixed(1)}</priority>\n`
  }

  if (url.alternates && url.alternates.length > 0) {
    url.alternates.forEach(alt => {
      xml += `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${escapeXml(alt.href)}" />\n`
    })
  }

  if (url.images && url.images.length > 0) {
    url.images.forEach(img => {
      xml += `    <image:image>\n`
      xml += `      <image:loc>${escapeXml(img.loc)}</image:loc>\n`
      if (img.title) {
        xml += `      <image:title>${escapeXml(img.title)}</image:title>\n`
      }
      if (img.caption) {
        xml += `      <image:caption>${escapeXml(img.caption)}</image:caption>\n`
      }
      xml += `    </image:image>\n`
    })
  }

  xml += `  </url>\n`
  return xml
}

function generateAlternates(path: string): Array<{ hreflang: string; href: string }> {
  const alternates = SUPPORTED_LANGUAGES.map(lang => ({
    hreflang: lang,
    href: `${BASE_URL}/${lang}${path}`
  }))

  alternates.push({
    hreflang: 'x-default',
    href: `${BASE_URL}/en${path}`
  })

  return alternates
}

function calculatePriority(item: Movie | TVShow): number {
  let priority = 0.5
  const popularity = Number(item.popularity) || 0
  const voteAverage = Number(item.vote_average) || 0

  if (popularity > 100) {
    priority = 0.9
  } else if (popularity > 50) {
    priority = 0.85
  } else if (popularity > 20) {
    priority = 0.75
  } else if (popularity > 10) {
    priority = 0.65
  } else {
    priority = 0.6
  }

  if (voteAverage >= 8.0) {
    priority = Math.min(1.0, priority + 0.05)
  }

  const releaseDate = 'release_date' in item ? item.release_date : (item as TVShow).first_air_date
  if (releaseDate) {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const itemDate = new Date(releaseDate)
    if (itemDate > sixMonthsAgo) {
      priority = Math.min(1.0, priority + 0.05)
    }
  }

  return Math.min(1.0, Math.max(0.5, priority))
}

function calculateChangefreq(item: Movie | TVShow): 'daily' | 'weekly' | 'monthly' {
  if ('in_production' in item && item.in_production) {
    return 'weekly'
  }

  const releaseDate = 'release_date' in item ? item.release_date : (item as TVShow).first_air_date
  if (releaseDate) {
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    const itemDate = new Date(releaseDate)
    if (itemDate > threeMonthsAgo) {
      return 'weekly'
    }
  }

  return 'monthly'
}

function createSlugFromName(id: number, name: string): string {
  const cleanName = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50)
  return `${id}-${cleanName}`
}

async function generateMainSitemap(): Promise<string> {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'

  const staticPages = [
    { path: '/', priority: 1.0, changefreq: 'daily' as const },
    { path: '/search', priority: 0.8, changefreq: 'daily' as const },
    { path: '/discover-lists', priority: 0.7, changefreq: 'weekly' as const },
    { path: '/about', priority: 0.5, changefreq: 'monthly' as const },
    { path: '/privacy', priority: 0.3, changefreq: 'yearly' as const },
    { path: '/terms', priority: 0.3, changefreq: 'yearly' as const },
    { path: '/contact', priority: 0.4, changefreq: 'monthly' as const },
  ]

  for (const page of staticPages) {
    for (const lang of SUPPORTED_LANGUAGES) {
      xml += generateXmlUrl({
        loc: `${BASE_URL}/${lang}${page.path}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: page.changefreq,
        priority: page.priority,
        alternates: generateAlternates(page.path)
      })
    }
  }

  xml += '</urlset>'
  return xml
}

async function generateMoviesSitemap(supabase: any): Promise<string> {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n'
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'

  try {
    const { data: movies, error } = await supabase
      .from('movies')
      .select('id, slug, title, original_title, popularity, vote_average, release_date, updated_at, poster_path, backdrop_path')
      .not('slug', 'is', null)
      .order('popularity', { ascending: false })
      .limit(MAX_URLS_PER_SITEMAP)

    if (error) {
      console.error('Error fetching movies:', error)
      throw error
    }

    if (movies && movies.length > 0) {
      console.log(`Generating sitemap for ${movies.length} movies`)

      for (const movie of movies as Movie[]) {
        const path = `/movie/${movie.slug}`
        const priority = calculatePriority(movie)
        const changefreq = calculateChangefreq(movie)

        const images = []
        if (movie.poster_path) {
          images.push({
            loc: `${TMDB_IMAGE_BASE}${movie.poster_path}`,
            title: movie.title || movie.original_title,
            caption: `${movie.title} (${movie.release_date ? new Date(movie.release_date).getFullYear() : ''}) - Movie Poster`
          })
        }
        if (movie.backdrop_path) {
          images.push({
            loc: `${TMDB_IMAGE_BASE}${movie.backdrop_path}`,
            title: movie.title || movie.original_title,
            caption: `${movie.title} - Movie Backdrop`
          })
        }

        for (const lang of SUPPORTED_LANGUAGES) {
          xml += generateXmlUrl({
            loc: `${BASE_URL}/${lang}${path}`,
            lastmod: movie.updated_at ? new Date(movie.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            changefreq,
            priority,
            alternates: generateAlternates(path),
            images: images.length > 0 ? images : undefined
          })
        }
      }
    }
  } catch (error) {
    console.error('Error generating movies sitemap:', error)
    throw error
  }

  xml += '</urlset>'
  return xml
}

async function generateTVShowsSitemap(supabase: any): Promise<string> {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n'
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'

  try {
    const { data: tvShows, error } = await supabase
      .from('tv_shows')
      .select('id, slug, name, original_name, popularity, vote_average, first_air_date, in_production, updated_at, poster_path, backdrop_path')
      .not('slug', 'is', null)
      .order('popularity', { ascending: false })
      .limit(MAX_URLS_PER_SITEMAP)

    if (error) {
      console.error('Error fetching TV shows:', error)
      throw error
    }

    if (tvShows && tvShows.length > 0) {
      console.log(`Generating sitemap for ${tvShows.length} TV shows`)

      for (const show of tvShows as TVShow[]) {
        const path = `/tv_show/${show.slug}`
        const priority = calculatePriority(show)
        const changefreq = calculateChangefreq(show)

        const images = []
        if (show.poster_path) {
          images.push({
            loc: `${TMDB_IMAGE_BASE}${show.poster_path}`,
            title: show.name || show.original_name,
            caption: `${show.name} (${show.first_air_date ? new Date(show.first_air_date).getFullYear() : ''}) - TV Show Poster`
          })
        }
        if (show.backdrop_path) {
          images.push({
            loc: `${TMDB_IMAGE_BASE}${show.backdrop_path}`,
            title: show.name || show.original_name,
            caption: `${show.name} - TV Show Backdrop`
          })
        }

        for (const lang of SUPPORTED_LANGUAGES) {
          xml += generateXmlUrl({
            loc: `${BASE_URL}/${lang}${path}`,
            lastmod: show.updated_at ? new Date(show.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            changefreq,
            priority,
            alternates: generateAlternates(path),
            images: images.length > 0 ? images : undefined
          })
        }
      }
    }
  } catch (error) {
    console.error('Error generating TV shows sitemap:', error)
    throw error
  }

  xml += '</urlset>'
  return xml
}

async function generatePersonSitemap(tmdbApiKey: string): Promise<string> {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n'
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'

  try {
    const people: Person[] = []

    for (let page = 1; page <= 10; page++) {
      const response = await fetch(
        `https://api.themoviedb.org/3/person/popular?api_key=${tmdbApiKey}&page=${page}`
      )

      if (!response.ok) {
        console.error(`Error fetching popular people page ${page}:`, response.statusText)
        break
      }

      const data = await response.json()
      if (data.results && data.results.length > 0) {
        people.push(...data.results)
      } else {
        break
      }

      if (people.length >= 2000) break
    }

    console.log(`Generating sitemap for ${people.length} people`)

    for (const person of people.slice(0, 2000)) {
      const slug = createSlugFromName(person.id, person.name)
      const path = `/person/${slug}`

      const images = []
      if (person.profile_path) {
        images.push({
          loc: `${TMDB_IMAGE_BASE}${person.profile_path}`,
          title: person.name,
          caption: `${person.name} - ${person.known_for_department || 'Actor'}`
        })
      }

      for (const lang of SUPPORTED_LANGUAGES) {
        xml += generateXmlUrl({
          loc: `${BASE_URL}/${lang}${path}`,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: 'monthly',
          priority: 0.7,
          alternates: generateAlternates(path),
          images: images.length > 0 ? images : undefined
        })
      }
    }
  } catch (error) {
    console.error('Error generating person sitemap:', error)
    throw error
  }

  xml += '</urlset>'
  return xml
}

async function generateSitemapIndex(): Promise<string> {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  const sitemaps = [
    { loc: `${BASE_URL}/sitemap-main.xml`, description: 'Main static pages' },
    { loc: `${BASE_URL}/sitemap-movies.xml`, description: 'All movies' },
    { loc: `${BASE_URL}/sitemap-tvshows.xml`, description: 'All TV shows' },
    { loc: `${BASE_URL}/sitemap-people.xml`, description: 'Popular actors and directors' },
  ]

  const lastmod = new Date().toISOString().split('T')[0]

  for (const sitemap of sitemaps) {
    xml += '  <sitemap>\n'
    xml += `    <loc>${escapeXml(sitemap.loc)}</loc>\n`
    xml += `    <lastmod>${lastmod}</lastmod>\n`
    xml += '  </sitemap>\n'
  }

  xml += '</sitemapindex>'
  return xml
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const tmdbApiKey = Deno.env.get('TMDB_API_KEY') ?? ''
    if (!tmdbApiKey) {
      throw new Error('TMDB_API_KEY environment variable is required')
    }

    const url = new URL(req.url)
    const type = url.searchParams.get('type') || 'index'

    console.log(`Generating sitemap type: ${type}`)

    let xml: string
    const contentType = 'application/xml'

    switch (type) {
      case 'main':
        xml = await generateMainSitemap()
        break
      case 'movies':
        xml = await generateMoviesSitemap(supabase)
        break
      case 'tvshows':
        xml = await generateTVShowsSitemap(supabase)
        break
      case 'people':
        xml = await generatePersonSitemap(tmdbApiKey)
        break
      case 'index':
      default:
        xml = await generateSitemapIndex()
        break
    }

    console.log(`Successfully generated ${type} sitemap (${xml.length} bytes)`)

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to generate sitemap',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})