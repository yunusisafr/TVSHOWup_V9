import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

function generateSlug(id: number, title: string): string {
  if (!title) return `${id}`

  return `${id}-${title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY')
    
    if (!TMDB_API_KEY) {
      throw new Error('TMDB_API_KEY is required')
    }

    const url = new URL(req.url)
    const contentType = url.searchParams.get('type') || 'both'
    const pages = parseInt(url.searchParams.get('pages') || '5')

    console.log(`🔥 Importing trending content (type: ${contentType}, pages: ${pages})`)

    let results = {
      movies: { imported: 0, errors: 0 },
      tvShows: { imported: 0, errors: 0 }
    }

    if (contentType === 'movie' || contentType === 'both') {
      console.log('🎬 Fetching trending movies...')
      for (let page = 1; page <= pages; page++) {
        try {
          const response = await fetch(
            `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}&page=${page}`
          )
          
          if (response.ok) {
            const data = await response.json()
            
            for (const movie of data.results || []) {
              try {
                const slug = generateSlug(movie.id, movie.original_title || movie.title)
                
                const { error } = await supabaseClient
                  .from('movies')
                  .upsert({
                    id: movie.id,
                    title: movie.title,
                    original_title: movie.original_title,
                    overview: movie.overview,
                    release_date: movie.release_date || null,
                    poster_path: movie.poster_path,
                    backdrop_path: movie.backdrop_path,
                    vote_average: movie.vote_average || 0,
                    vote_count: movie.vote_count || 0,
                    popularity: movie.popularity || 0,
                    adult: movie.adult || false,
                    original_language: movie.original_language,
                    video: movie.video || false,
                    slug,
                    updated_at: new Date().toISOString()
                  })
                
                if (error) {
                  console.error(`Error importing movie ${movie.id}:`, error)
                  results.movies.errors++
                } else {
                  results.movies.imported++
                }
              } catch (error) {
                console.error(`Error processing movie ${movie.id}:`, error)
                results.movies.errors++
              }
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 300))
        } catch (error) {
          console.error(`Error fetching movies page ${page}:`, error)
        }
      }
    }

    if (contentType === 'tv' || contentType === 'both') {
      console.log('📺 Fetching trending TV shows...')
      for (let page = 1; page <= pages; page++) {
        try {
          const response = await fetch(
            `https://api.themoviedb.org/3/trending/tv/week?api_key=${TMDB_API_KEY}&page=${page}`
          )
          
          if (response.ok) {
            const data = await response.json()
            
            for (const show of data.results || []) {
              try {
                const slug = generateSlug(show.id, show.original_name || show.name)
                
                const { error } = await supabaseClient
                  .from('tv_shows')
                  .upsert({
                    id: show.id,
                    name: show.name,
                    original_name: show.original_name,
                    overview: show.overview,
                    first_air_date: show.first_air_date || null,
                    poster_path: show.poster_path,
                    backdrop_path: show.backdrop_path,
                    vote_average: show.vote_average || 0,
                    vote_count: show.vote_count || 0,
                    popularity: show.popularity || 0,
                    adult: show.adult || false,
                    original_language: show.original_language,
                    origin_country: show.origin_country || null,
                    slug,
                    updated_at: new Date().toISOString()
                  })
                
                if (error) {
                  console.error(`Error importing TV show ${show.id}:`, error)
                  results.tvShows.errors++
                } else {
                  results.tvShows.imported++
                }
              } catch (error) {
                console.error(`Error processing TV show ${show.id}:`, error)
                results.tvShows.errors++
              }
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 300))
        } catch (error) {
          console.error(`Error fetching TV shows page ${page}:`, error)
        }
      }
    }

    console.log('✅ Import completed:', results)

    return new Response(
      JSON.stringify({
        success: true,
        results,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Import error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})