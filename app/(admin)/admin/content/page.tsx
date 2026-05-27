
'use client';

import { useState } from 'react';
import { 
  FileText, 
  HelpCircle, 
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  status: 'published' | 'draft';
  image: string;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
  category: string;
}

interface Announcement {
  id: number;
  title: string;
  message: string;
  status: 'active' | 'inactive';
  date: string;
}

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<'blog' | 'faqs' | 'announcements'>('blog');
  
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  const [faqs, setFaqs] = useState<FAQ[]>([]);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [showBlogModal, setShowBlogModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleDeleteBlog = (id: number) => {
    if (confirm('Delete this blog post?')) {
      setBlogPosts(blogPosts.filter(p => p.id !== id));
    }
  };

  const handleDeleteFAQ = (id: number) => {
    if (confirm('Delete this FAQ?')) {
      setFaqs(faqs.filter(f => f.id !== id));
    }
  };

  const handleDeleteAnnouncement = (id: number) => {
    if (confirm('Delete this announcement?')) {
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  const handleToggleAnnouncement = (id: number) => {
    setAnnouncements(announcements.map(a => 
      a.id === id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage blog posts, FAQs, and announcements (Powered by Directus CMS)</p>
      </div>

      {/* Tabs */}
      <div className="border-b dark:border-gray-700">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('blog')}
            className={`pb-3 px-1 font-medium transition ${
              activeTab === 'blog' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="inline h-4 w-4 mr-2" />
            Blog Posts
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`pb-3 px-1 font-medium transition ${
              activeTab === 'faqs' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <HelpCircle className="inline h-4 w-4 mr-2" />
            FAQs
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`pb-3 px-1 font-medium transition ${
              activeTab === 'announcements' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Megaphone className="inline h-4 w-4 mr-2" />
            Announcements
          </button>
        </div>
      </div>

      {/* Blog Posts Tab */}
      {activeTab === 'blog' && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <button
              onClick={() => {
                setEditingItem(null);
                setShowBlogModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>New Blog Post</span>
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input type="text" placeholder="Search posts..." className="pl-10 pr-4 py-2 border rounded-lg" />
            </div>
          </div>

          <div className="space-y-4">
            {blogPosts.map((post) => (
              <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{post.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{post.excerpt}</p>
                    <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                      <span>By {post.author}</span>
                      <span>{post.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100">
                      <Eye className="h-4 w-4 text-gray-500" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100">
                      <Edit className="h-4 w-4 text-gray-500" />
                    </button>
                    <button onClick={() => handleDeleteBlog(post.id)} className="p-2 rounded-lg hover:bg-gray-100">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQs Tab */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <button
            onClick={() => {
              setEditingItem(null);
              setShowFAQModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add FAQ</span>
          </button>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{faq.question}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{faq.answer}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500">{faq.category}</span>
                      <span className="text-xs text-gray-500">Order: {faq.order}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100">
                      <Edit className="h-4 w-4 text-gray-500" />
                    </button>
                    <button onClick={() => handleDeleteFAQ(faq.id)} className="p-2 rounded-lg hover:bg-gray-100">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <button
            onClick={() => {
              setEditingItem(null);
              setShowAnnouncementModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>New Announcement</span>
          </button>

          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{announcement.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${announcement.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {announcement.status}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{announcement.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{announcement.date}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleAnnouncement(announcement.id)}
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      {announcement.status === 'active' ? <XCircle className="h-4 w-4 text-red-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100">
                      <Edit className="h-4 w-4 text-gray-500" />
                    </button>
                    <button onClick={() => handleDeleteAnnouncement(announcement.id)} className="p-2 rounded-lg hover:bg-gray-100">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Directus Integration Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">CMS</div>
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Directus CMS Integration</p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
              This content is managed through Directus CMS. Changes made here sync with your Directus database.
              Access the full admin panel at <code className="bg-blue-100 dark:bg-blue-900/50 px-1 rounded">http://localhost:8055/admin</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
