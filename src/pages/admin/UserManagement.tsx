import React, { useState, useEffect } from 'react';
import { Users, Shield, Search, Trash2, RefreshCw, UserCog, Crown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';

interface User {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  last_sign_in_at?: string;
  is_admin?: boolean;
  admin_role?: string;
}

const UserManagement: React.FC = () => {
  const { logAdminAction } = useAdmin();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminRole, setAdminRole] = useState<'admin' | 'moderator' | 'editor'>('editor');
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all user profiles - by default they are regular users with no admin privileges
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (profilesError) throw profilesError;

      // Fetch admin users - ONLY users in this table have admin privileges
      // Admin privileges must be explicitly granted, never automatic
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id, role');

      if (adminError && adminError.code !== 'PGRST116') throw adminError;

      // Combine the data: users are regular by default, admin status comes from admin_users table
      const adminMap = new Map(adminData?.map(admin => [admin.id, admin.role]) || []);

      const combinedUsers: User[] = (profilesData || []).map(profile => ({
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
        created_at: profile.created_at,
        last_sign_in_at: profile.last_sign_in_at,
        is_admin: adminMap.has(profile.id),
        admin_role: adminMap.get(profile.id),
      }));

      setUsers(combinedUsers);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Kullanıcılar yüklenirken hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMakeAdmin = async (user: User) => {
    setSelectedUser(user);
    setAdminRole('editor');
    setShowAdminModal(true);
  };

  const handleRemoveAdmin = async (user: User) => {
    if (!confirm(`${user.display_name} kullanıcısının admin yetkilerini kaldırmak istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      await logAdminAction('remove_admin', 'user', user.id, {
        user_email: user.email,
        user_display_name: user.display_name,
      });

      await fetchUsers();
      alert('Admin yetkileri başarıyla kaldırıldı');
    } catch (err: any) {
      console.error('Error removing admin:', err);
      alert('Hata: ' + err.message);
    }
  };

  const confirmMakeAdmin = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('admin_users')
        .upsert({
          id: selectedUser.id,
          role: adminRole,
          permissions: {},
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      await logAdminAction('make_admin', 'user', selectedUser.id, {
        user_email: selectedUser.email,
        user_display_name: selectedUser.display_name,
        admin_role: adminRole,
      });

      await fetchUsers();
      setShowAdminModal(false);
      setSelectedUser(null);
      alert('Kullanıcı başarıyla admin yapıldı');
    } catch (err: any) {
      console.error('Error making admin:', err);
      alert('Hata: ' + err.message);
    }
  };

  const getRoleBadge = (role?: string) => {
    const roleColors = {
      admin: 'bg-red-500/20 text-red-400 border-red-500/50',
      moderator: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      editor: 'bg-green-500/20 text-green-400 border-green-500/50',
    };

    const roleNames = {
      admin: 'Admin',
      moderator: 'Moderatör',
      editor: 'Editör',
    };

    if (!role) return null;

    return (
      <span className={`px-2 py-1 rounded text-xs border ${roleColors[role as keyof typeof roleColors]}`}>
        {roleNames[role as keyof typeof roleNames]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Kullanıcı Yönetimi</h1>
        <p className="text-gray-400">
          Sistemdeki kullanıcıları yönetin ve admin yetkileri atayın
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Toplam Kullanıcı</p>
              <p className="text-3xl font-bold text-white">{users.length}</p>
            </div>
            <Users className="w-12 h-12 text-primary-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Admin Kullanıcılar</p>
              <p className="text-3xl font-bold text-white">
                {users.filter(u => u.is_admin).length}
              </p>
            </div>
            <Shield className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Normal Kullanıcılar</p>
              <p className="text-3xl font-bold text-white">
                {users.filter(u => !u.is_admin).length}
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="E-posta veya kullanıcı adı ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-400">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  E-posta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Kayıt Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-primary-500 animate-spin mr-2" />
                      <span className="text-gray-400">Yükleniyor...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    {searchQuery ? 'Kullanıcı bulunamadı' : 'Henüz kullanıcı yok'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user.display_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {user.display_name}
                          </div>
                          <div className="text-sm text-gray-400">ID: {user.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_admin ? (
                        <div className="flex items-center space-x-2">
                          <Crown className="w-4 h-4 text-yellow-400" />
                          {getRoleBadge(user.admin_role)}
                        </div>
                      ) : (
                        <span className="text-gray-500">Normal Kullanıcı</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.is_admin ? (
                        <button
                          onClick={() => handleRemoveAdmin(user)}
                          className="text-red-400 hover:text-red-300 transition-colors flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Admin Kaldır
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMakeAdmin(user)}
                          className="text-primary-400 hover:text-primary-300 transition-colors flex items-center"
                        >
                          <UserCog className="w-4 h-4 mr-1" />
                          Admin Yap
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Role Selection Modal */}
      {showAdminModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Admin Yetkilendirme</h3>
            <p className="text-gray-400 mb-4">
              <strong className="text-white">{selectedUser.display_name}</strong> kullanıcısına
              admin yetkisi vermek istediğinizden emin misiniz?
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Rolü Seçin
              </label>
              <select
                value={adminRole}
                onChange={(e) => setAdminRole(e.target.value as any)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="editor">Editör (Sınırlı Yetki)</option>
                <option value="moderator">Moderatör (Orta Yetki)</option>
                <option value="admin">Admin (Tam Yetki)</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                {adminRole === 'editor' && 'Editör: İçerik düzenleme yetkisi'}
                {adminRole === 'moderator' && 'Moderatör: İçerik ve kullanıcı yönetimi'}
                {adminRole === 'admin' && 'Admin: Tüm yetkilere sahip'}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowAdminModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={confirmMakeAdmin}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Onayla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
