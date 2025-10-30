import { databaseService } from './database'
import { SUPPORTED_LANGUAGES } from './utils'

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  alternates?: Array<{ hreflang: string; href: string }>
}

export class SitemapGenerator {
  private baseUrl: string

  constructor(baseUrl: string = 'https://www.tvshowup.com') {
    this.baseUrl = baseUrl
  }

  private generateXmlUrl(url: SitemapUrl): string {
    let xml = `  <url>\n`
    xml += `    <loc>${this.escapeXml(url.loc)}</loc>\n`

    if (url.lastmod) {
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`
    }

    if (url.changefreq) {
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`
    }

    if (url.priority !== undefined) {
      xml += `    <priority>${url.priority}</priority>\n`
    }

    if (url.alternates && url.alternates.length > 0) {
      url.alternates.forEach(alt => {
        xml += `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${this.escapeXml(alt.href)}" />\n`
      })
    }

    xml += `  </url>\n`
    return xml
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  private generateAlternates(path: string): Array<{ hreflang: string; href: string }> {
    const alternates = SUPPORTED_LANGUAGES.map(lang => ({
      hreflang: lang,
      href: `${this.baseUrl}/${lang}${path}`
    }))

    alternates.push({
      hreflang: 'x-default',
      href: `${this.baseUrl}/en${path}`
    })

    return alternates
  }

  async generateMainSitemap(): Promise<string> {
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
        xml += this.generateXmlUrl({
          loc: `${this.baseUrl}/${lang}${page.path}`,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: page.changefreq,
          priority: page.priority,
          alternates: this.generateAlternates(page.path)
        })
      }
    }

    xml += '</urlset>'
    return xml
  }

  async generateMoviesSitemap(limit: number = 10000): Promise<string> {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
    xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'

    try {
      const { data: movies } = await databaseService.supabase
        .from('movies')
        .select('id, slug, title, original_title, popularity, vote_average, release_date, updated_at')
        .not('slug', 'is', null)
        .order('popularity', { ascending: false })
        .limit(limit)

      if (movies) {
        for (const movie of movies) {
          const path = `/movie/${movie.slug}`
          const priority = this.calculatePriority(movie)
          const changefreq = this.calculateChangefreq(movie)

          for (const lang of SUPPORTED_LANGUAGES) {
            xml += this.generateXmlUrl({
              loc: `${this.baseUrl}/${lang}${path}`,
              lastmod: movie.updated_at ? new Date(movie.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              changefreq,
              priority,
              alternates: this.generateAlternates(path)
            })
          }
        }
      }
    } catch (error) {
      console.error('Error generating movies sitemap:', error)
    }

    xml += '</urlset>'
    return xml
  }

  async generateTVShowsSitemap(limit: number = 10000): Promise<string> {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
    xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'

    try {
      const { data: tvShows } = await databaseService.supabase
        .from('tv_shows')
        .select('id, slug, name, original_name, popularity, vote_average, first_air_date, in_production, updated_at')
        .not('slug', 'is', null)
        .order('popularity', { ascending: false })
        .limit(limit)

      if (tvShows) {
        for (const show of tvShows) {
          const path = `/tv_show/${show.slug}`
          const priority = this.calculatePriority(show)
          const changefreq = this.calculateChangefreq(show)

          for (const lang of SUPPORTED_LANGUAGES) {
            xml += this.generateXmlUrl({
              loc: `${this.baseUrl}/${lang}${path}`,
              lastmod: show.updated_at ? new Date(show.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              changefreq,
              priority,
              alternates: this.generateAlternates(path)
            })
          }
        }
      }
    } catch (error) {
      console.error('Error generating TV shows sitemap:', error)
    }

    xml += '</urlset>'
    return xml
  }

  async generateSitemapIndex(): Promise<string> {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    const sitemaps = [
      { loc: `${this.baseUrl}/sitemap-main.xml`, lastmod: new Date().toISOString().split('T')[0] },
      { loc: `${this.baseUrl}/sitemap-movies.xml`, lastmod: new Date().toISOString().split('T')[0] },
      { loc: `${this.baseUrl}/sitemap-tvshows.xml`, lastmod: new Date().toISOString().split('T')[0] },
      { loc: `${this.baseUrl}/sitemap-people.xml`, lastmod: new Date().toISOString().split('T')[0] },
    ]

    for (const sitemap of sitemaps) {
      xml += '  <sitemap>\n'
      xml += `    <loc>${this.escapeXml(sitemap.loc)}</loc>\n`
      xml += `    <lastmod>${sitemap.lastmod}</lastmod>\n`
      xml += '  </sitemap>\n'
    }

    xml += '</sitemapindex>'
    return xml
  }

  private calculatePriority(item: any): number {
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

    const releaseDate = item.release_date || item.first_air_date
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

  private calculateChangefreq(item: any): 'daily' | 'weekly' | 'monthly' {
    if (item.in_production) {
      return 'weekly'
    }

    const releaseDate = item.release_date || item.first_air_date
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
}

export const sitemapGenerator = new SitemapGenerator()
