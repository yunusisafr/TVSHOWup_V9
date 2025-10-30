import React, { useState, useEffect } from 'react';
import { Plus, Edit, Eye, Trash2, FileText, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';
import { StaticPage } from '../../lib/database';
import PageHeader from '../../components/admin/PageHeader';
import DataTable from '../../components/admin/DataTable';
import LoadingSpinner from '../../components/admin/LoadingSpinner';
import EmptyState from '../../components/admin/EmptyState';
import StaticPageModal from '../../components/admin/StaticPageModal';
import StaticPagePreviewModal from '../../components/admin/StaticPagePreviewModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const StaticPages: React.FC = () => {
  const { isAdmin, logAdminAction } = useAdmin();
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPublished, setFilterPublished] = useState<'all' | 'published' | 'draft'>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPage, setSelectedPage] = useState<StaticPage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (isAdmin) {
      loadPages();
    }
  }, [isAdmin]);

  const loadPages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('static_pages')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setPages(data || []);
    } catch (error) {
      console.error('Error loading static pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedPage(null);
    setShowEditModal(true);
  };

  const handleEdit = (page: StaticPage) => {
    setSelectedPage(page);
    setShowEditModal(true);
  };

  const handlePreview = (page: StaticPage) => {
    setSelectedPage(page);
    setShowPreviewModal(true);
  };

  const handleDeleteClick = (page: StaticPage) => {
    setSelectedPage(page);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedPage) return;

    try {
      const { error } = await supabase
        .from('static_pages')
        .delete()
        .eq('id', selectedPage.id);

      if (error) throw error;

      await logAdminAction('delete_static_page', 'static_page', selectedPage.id, {
        title: selectedPage.title,
        slug: selectedPage.slug
      });

      setPages(pages.filter(p => p.id !== selectedPage.id));
      setShowDeleteDialog(false);
      setSelectedPage(null);
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Failed to delete page');
    }
  };

  const handleSave = async () => {
    await loadPages();
    setShowEditModal(false);
    setSelectedPage(null);
  };

  const getTranslationStatus = (page: StaticPage): React.ReactNode => {
    const languages = ['en', 'tr', 'de', 'fr', 'es', 'it', 'ar'];
    const titleTranslations = page.title_translations || {};
    const contentTranslations = page.content_translations || {};

    const availableCount = languages.filter(lang => {
      const hasTitle = titleTranslations[lang];
      const hasContent = contentTranslations[lang];
      return hasTitle && hasContent;
    }).length;

    const percentage = Math.round((availableCount / languages.length) * 100);

    return (
      <div className="flex items-center space-x-2">
        <div className="w-20 bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              percentage === 100 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-gray-400">{availableCount}/{languages.length}</span>
      </div>
    );
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch =
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterPublished === 'all' ||
      (filterPublished === 'published' && page.is_published) ||
      (filterPublished === 'draft' && !page.is_published);

    return matchesSearch && matchesFilter;
  });

  const paginatedPages = filteredPages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'slug', label: 'Slug' },
    {
      key: 'is_published',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded text-xs ${
          value ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
        }`}>
          {value ? 'Published' : 'Draft'}
        </span>
      )
    },
    {
      key: 'translations',
      label: 'Translations',
      render: (_: any, row: StaticPage) => getTranslationStatus(row)
    },
    {
      key: 'updated_at',
      label: 'Last Updated',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: StaticPage) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handlePreview(row); }}
            className="p-1 text-green-400 hover:text-green-300 transition-colors"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(row); }}
            className="p-1 text-red-400 hover:text-red-300 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
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
        title="Static Pages"
        breadcrumbs={[{ label: 'Dashboard', href: '/admin' }, { label: 'Static Pages' }]}
        actions={
          <button
            onClick={handleCreateNew}
            className="flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Page
          </button>
        }
      />

      <div className="p-8 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
          </div>

          <select
            value={filterPublished}
            onChange={(e) => setFilterPublished(e.target.value as 'all' | 'published' | 'draft')}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {filteredPages.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No pages found"
            description={searchTerm ? "Try adjusting your search" : "Create your first static page"}
            action={!searchTerm ? {
              label: "Create New Page",
              onClick: handleCreateNew
            } : undefined}
          />
        ) : (
          <DataTable
            columns={columns}
            data={paginatedPages}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: setCurrentPage
            }}
          />
        )}
      </div>

      {showEditModal && (
        <StaticPageModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPage(null);
          }}
          onSave={handleSave}
          page={selectedPage}
        />
      )}

      {showPreviewModal && selectedPage && (
        <StaticPagePreviewModal
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedPage(null);
          }}
          page={selectedPage}
        />
      )}

      {showDeleteDialog && selectedPage && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedPage(null);
          }}
          onConfirm={handleDelete}
          title="Delete Page"
          message={`Are you sure you want to delete "${selectedPage.title}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmStyle="danger"
        />
      )}
    </div>
  );
};

export default StaticPages;
