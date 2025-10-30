import React, { useState, useEffect } from 'react';
import { Languages, Play, CheckCircle, AlertCircle, Loader, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TranslationStats {
  totalMovies: number;
  totalTvShows: number;
  moviesWithIncompleteTranslations: number;
  tvShowsWithIncompleteTranslations: number;
  movieStats: {
    tr: number;
    de: number;
    fr: number;
    es: number;
    it: number;
  };
  tvShowStats: {
    tr: number;
    de: number;
    fr: number;
    es: number;
    it: number;
  };
}

const TranslationSync: React.FC = () => {
  const [syncing, setSyncing] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState<TranslationStats | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      // Get movie statistics
      const { data: movieData, error: movieError } = await supabase
        .from('movies')
        .select('title_translations')
        .limit(10000);

      if (movieError) throw movieError;

      // Get TV show statistics
      const { data: tvShowData, error: tvShowError } = await supabase
        .from('tv_shows')
        .select('name_translations')
        .limit(10000);

      if (tvShowError) throw tvShowError;

      const languages = ['tr', 'de', 'fr', 'es', 'it'];

      // Calculate movie stats
      const movieStats = {
        tr: 0,
        de: 0,
        fr: 0,
        es: 0,
        it: 0,
      };

      let moviesWithIncomplete = 0;
      movieData?.forEach((movie: any) => {
        let hasAllTranslations = true;
        languages.forEach((lang) => {
          if (movie.title_translations && movie.title_translations[lang]) {
            movieStats[lang as keyof typeof movieStats]++;
          } else {
            hasAllTranslations = false;
          }
        });
        if (!hasAllTranslations) moviesWithIncomplete++;
      });

      // Calculate TV show stats
      const tvShowStats = {
        tr: 0,
        de: 0,
        fr: 0,
        es: 0,
        it: 0,
      };

      let tvShowsWithIncomplete = 0;
      tvShowData?.forEach((show: any) => {
        let hasAllTranslations = true;
        languages.forEach((lang) => {
          if (show.name_translations && show.name_translations[lang]) {
            tvShowStats[lang as keyof typeof tvShowStats]++;
          } else {
            hasAllTranslations = false;
          }
        });
        if (!hasAllTranslations) tvShowsWithIncomplete++;
      });

      setStats({
        totalMovies: movieData?.length || 0,
        totalTvShows: tvShowData?.length || 0,
        moviesWithIncompleteTranslations: moviesWithIncomplete,
        tvShowsWithIncompleteTranslations: tvShowsWithIncomplete,
        movieStats,
        tvShowStats,
      });
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setError('İstatistikler yüklenirken hata oluştu: ' + err.message);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSyncTranslations = async () => {
    setSyncing(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-all-translations`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            batchSize: 50,
            contentType: 'both'
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(
          `HTTP ${response.status}: ${errorData.error || 'Translation sync failed'}\n` +
          `Details: ${errorData.details || 'No details available'}`
        );
      }

      const data = await response.json();
      setResult(data);
      console.log('✅ Translation sync completed:', data);

      // Refresh stats after sync
      await fetchStats();
    } catch (err: any) {
      console.error('❌ Translation sync error:', err);
      setError(err.message || 'Translation sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const getLanguageName = (code: string) => {
    const names: { [key: string]: string } = {
      tr: 'Türkçe',
      de: 'Almanca',
      fr: 'Fransızca',
      es: 'İspanyolca',
      it: 'İtalyanca',
    };
    return names[code] || code.toUpperCase();
  };

  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Çeviri Senkronizasyonu</h1>
        <p className="text-gray-400">
          Veritabanındaki içeriklerin çevirilerini TMDB'den çekin ve güncelleyin
        </p>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Movies Stats */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Filmler</h2>
            <button
              onClick={fetchStats}
              disabled={loadingStats}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loadingStats ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingStats ? (
            <div className="text-center py-8">
              <Loader className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-900/50 rounded p-3">
                  <p className="text-sm text-gray-400">Toplam Film</p>
                  <p className="text-2xl font-bold text-white">{stats.totalMovies}</p>
                </div>
                <div className="bg-gray-900/50 rounded p-3">
                  <p className="text-sm text-gray-400">Eksik Çeviri</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {stats.moviesWithIncompleteTranslations}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-400 mb-2">Dil Bazında Çeviri Durumu:</p>
                {Object.entries(stats.movieStats).map(([lang, count]) => (
                  <div key={lang} className="flex items-center justify-between">
                    <span className="text-gray-300">{getLanguageName(lang)}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${getPercentage(count, stats.totalMovies)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 w-16 text-right">
                        {count} ({getPercentage(count, stats.totalMovies)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>

        {/* TV Shows Stats */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Diziler</h2>
            <button
              onClick={fetchStats}
              disabled={loadingStats}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loadingStats ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingStats ? (
            <div className="text-center py-8">
              <Loader className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-900/50 rounded p-3">
                  <p className="text-sm text-gray-400">Toplam Dizi</p>
                  <p className="text-2xl font-bold text-white">{stats.totalTvShows}</p>
                </div>
                <div className="bg-gray-900/50 rounded p-3">
                  <p className="text-sm text-gray-400">Eksik Çeviri</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {stats.tvShowsWithIncompleteTranslations}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-400 mb-2">Dil Bazında Çeviri Durumu:</p>
                {Object.entries(stats.tvShowStats).map(([lang, count]) => (
                  <div key={lang} className="flex items-center justify-between">
                    <span className="text-gray-300">{getLanguageName(lang)}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${getPercentage(count, stats.totalTvShows)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 w-16 text-right">
                        {count} ({getPercentage(count, stats.totalTvShows)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Sync Action Section */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-start mb-6">
          <Languages className="w-8 h-8 text-primary-400 mr-4 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Toplu Çeviri Güncelleme
            </h2>
            <p className="text-gray-300 mb-4">
              Bu işlem, veritabanındaki çevirisi eksik içerikleri tespit edip TMDB'den
              tüm desteklenen dillerde (TR, DE, FR, ES, IT) çeviri bilgilerini çeker.
            </p>
            <ul className="text-gray-400 text-sm space-y-1 mb-4">
              <li>• Her seferinde 50 film ve 50 dizi işlenir</li>
              <li>• Sadece çevirisi eksik içerikler güncellenir</li>
              <li>• İşlem birkaç dakika sürebilir</li>
              <li>• Gerekirse butona tekrar basarak devam edebilirsiniz</li>
            </ul>
          </div>
        </div>

        <button
          onClick={handleSyncTranslations}
          disabled={syncing}
          className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-colors ${
            syncing
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700'
          } text-white`}
        >
          {syncing ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Çeviriler Güncelleniyor...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Çevirileri Güncelle
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-6">
          <div className="flex items-start mb-4">
            <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-300 mb-2">
                İşlem Tamamlandı
              </h3>
              <div className="space-y-2 text-gray-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded p-3">
                    <p className="text-sm text-gray-400">Filmler</p>
                    <p className="text-2xl font-bold text-white">
                      {result.results?.movies?.synced || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      Güncellendi | {result.results?.movies?.failed || 0} Hata
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded p-3">
                    <p className="text-sm text-gray-400">Diziler</p>
                    <p className="text-2xl font-bold text-white">
                      {result.results?.tvShows?.synced || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      Güncellendi | {result.results?.tvShows?.failed || 0} Hata
                    </p>
                  </div>
                </div>
                {result.results?.movies?.synced === 0 && result.results?.tvShows?.synced === 0 && (
                  <p className="text-yellow-400 mt-4">
                    ✅ Tüm içeriklerin çevirileri güncel! Güncellenmesi gereken içerik bulunamadı.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-red-400 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-300 mb-2">Hata Oluştu</h3>
              <p className="text-gray-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-3">Bilgi</h3>
        <div className="space-y-2 text-gray-400 text-sm">
          <p>
            <strong className="text-white">Çeviri Alanları:</strong> title/name, overview, tagline
          </p>
          <p>
            <strong className="text-white">Desteklenen Diller:</strong> TR (Türkçe), DE (Almanca),
            FR (Fransızca), ES (İspanyolca), IT (İtalyanca)
          </p>
          <p>
            <strong className="text-white">Çalışma Mantığı:</strong> Kullanıcılar siteyi kendi
            dillerinde görüntülediklerinde, içeriklerin başlık ve açıklamaları otomatik olarak
            o dilde gösterilir. Eğer bir dilde çeviri yoksa İngilizce gösterilir.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TranslationSync;
