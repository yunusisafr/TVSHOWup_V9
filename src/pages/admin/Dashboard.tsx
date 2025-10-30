import React, { useState, useEffect } from 'react';
import { Film, Users, List, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';
import PageHeader from '../../components/admin/PageHeader';
import StatCard from '../../components/admin/StatCard';
import DataTable from '../../components/admin/DataTable';
import LoadingSpinner from '../../components/admin/LoadingSpinner';

interface DashboardStats {
  totalContent: number;
  totalUsers: number;
  totalLists: number;
  totalActiveAds: number;
}

interface RecentContent {
  id: number;
  title: string;
  content_type: string;
  poster_path: string;
  created_at: string;
}

interface TranslationStat {
  language: string;
  count: number;
  percentage: number;
}

const Dashboard: React.FC = () => {
  const { isAdmin, logAdminAction } = useAdmin();
  const [stats, setStats] = useState<DashboardStats>({
    totalContent: 0,
    totalUsers: 0,
    totalLists: 0,
    totalActiveAds: 0
  });
  const [recentContent, setRecentContent] = useState<RecentContent[]>([]);
  const [translationStats, setTranslationStats] = useState<TranslationStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
      logAdminAction('view_dashboard');
    }
  }, [isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [moviesResult, tvShowsResult, usersResult, listsResult, adsResult] = await Promise.all([
        supabase.from('movies').select('id', { count: 'exact', head: true }),
        supabase.from('tv_shows').select('id', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('share_lists').select('id', { count: 'exact', head: true }),
        supabase.from('ad_units').select('id', { count: 'exact', head: true }).eq('is_active', true)
      ]);

      const totalMovies = moviesResult.count || 0;
      const totalTvShows = tvShowsResult.count || 0;

      setStats({
        totalContent: totalMovies + totalTvShows,
        totalUsers: usersResult.count || 0,
        totalLists: listsResult.count || 0,
        totalActiveAds: adsResult.count || 0
      });

      const { data: recentMovies } = await supabase
        .from('movies')
        .select('id, title, poster_path, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentTvShows } = await supabase
        .from('tv_shows')
        .select('id, name as title, poster_path, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const combinedRecent = [
        ...(recentMovies || []).map(m => ({ ...m, content_type: 'movie' })),
        ...(recentTvShows || []).map(t => ({ ...t, content_type: 'tv_show' }))
      ]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      setRecentContent(combinedRecent);

      const languages = ['en', 'tr', 'de', 'fr', 'es', 'it'];
      const translationData: TranslationStat[] = [];

      for (const lang of languages) {
        const [moviesWithLang, tvShowsWithLang] = await Promise.all([
          supabase
            .from('movies')
            .select('id', { count: 'exact', head: true })
            .not('title_translations', 'is', null)
            .filter('title_translations', 'cs', `{"${lang}"`),
          supabase
            .from('tv_shows')
            .select('id', { count: 'exact', head: true })
            .not('name_translations', 'is', null)
            .filter('name_translations', 'cs', `{"${lang}"`)
        ]);

        const count = (moviesWithLang.count || 0) + (tvShowsWithLang.count || 0);
        const percentage = totalMovies + totalTvShows > 0
          ? Math.round((count / (totalMovies + totalTvShows)) * 100)
          : 0;

        translationData.push({
          language: lang.toUpperCase(),
          count,
          percentage
        });
      }

      setTranslationStats(translationData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentContentColumns = [
    {
      key: 'poster_path',
      label: 'Poster',
      render: (value: string, row: RecentContent) => (
        <img
          src={value ? `https://image.tmdb.org/t/p/w92${value}` : '/placeholder-poster.jpg'}
          alt={row.title}
          className="w-12 h-18 object-cover rounded"
        />
      )
    },
    { key: 'title', label: 'Title' },
    {
      key: 'content_type',
      label: 'Type',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded text-xs ${
          value === 'movie' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
        }`}>
          {value === 'movie' ? 'Movie' : 'TV Show'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Added',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <PageHeader
        title="Dashboard"
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Content"
            value={stats.totalContent.toLocaleString()}
            icon={Film}
            iconColor="text-blue-400"
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            iconColor="text-green-400"
          />
          <StatCard
            title="Total Lists"
            value={stats.totalLists.toLocaleString()}
            icon={List}
            iconColor="text-purple-400"
          />
          <StatCard
            title="Active Ads"
            value={stats.totalActiveAds.toLocaleString()}
            icon={TrendingUp}
            iconColor="text-yellow-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent Content
            </h2>
            <DataTable
              columns={recentContentColumns}
              data={recentContent}
              emptyMessage="No recent content"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-4">Translation Coverage</h2>
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="space-y-4">
                {translationStats.map((stat) => (
                  <div key={stat.language}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">{stat.language}</span>
                      <span className="text-sm text-gray-400">
                        {stat.count} ({stat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/translations"
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-center"
            >
              <h3 className="text-white font-semibold mb-2">Translation Sync</h3>
              <p className="text-gray-400 text-sm">Sync translations from TMDB</p>
            </a>
            <a
              href="/admin/pages"
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-center"
            >
              <h3 className="text-white font-semibold mb-2">Static Pages</h3>
              <p className="text-gray-400 text-sm">Manage website pages</p>
            </a>
            <a
              href="/admin/content"
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-center"
            >
              <h3 className="text-white font-semibold mb-2">Content Management</h3>
              <p className="text-gray-400 text-sm">Manage movies and TV shows</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
