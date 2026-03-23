import React from 'react'
import { 
  Search, 
  Plus, 
  LayoutGrid, 
  Share2, 
  MoreVertical, 
  Sparkles, 
  Image as ImageIcon,
  Mic,
  Globe,
  Settings,
  HelpCircle,
  Sun
} from 'lucide-react'

const Dashboard = ({ onOpenProject }) => {
  const projects = [
    { id: 1, title: 'Tolzy Canvas Editor', date: 'Mar 23, 2026', type: 'today' },
    { id: 2, title: 'Tolzy Canvas - Technical Specification & PRD', date: 'Mar 23, 2026', type: 'today' },
    { id: 3, title: 'Tolzy AI Changelog Page', date: 'Mar 22, 2026', type: 'yesterday' },
    { id: 4, title: 'Indoor Plant Care Dashboard', date: 'May 19, 2025', type: 'example' },
    { id: 5, title: 'Alps skiing guide', date: 'May 19, 2025', type: 'example' },
    { id: 6, title: 'Ceramic & Pottery Marketplace', date: 'May 19, 2025', type: 'example' },
    { id: 7, title: 'Board game club planner', date: 'May 16, 2025', type: 'example' },
  ]

  return (
    <div style={styles.container}>
      {/* Top Navigation */}
      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <div style={styles.menuIcon}>
            <div style={styles.userAvatar}>M</div>
          </div>
          <div style={styles.navIcons}>
             <MoreVertical size={20} color="var(--text-secondary)" />
             <LayoutGrid size={20} color="var(--text-secondary)" />
             <ImageIcon size={20} color="var(--text-secondary)" />
             <Share2 size={20} color="var(--text-secondary)" />
             <span style={styles.navLink}>Docs</span>
             <LayoutGrid size={18} color="var(--text-secondary)" />
          </div>
        </div>
        <div style={styles.logo}>
          <span style={styles.logoText}>Tolzy</span>
          <span style={styles.betaTag}>BETA</span>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* Central Area */}
        <div style={styles.centerArea}>
          <div style={styles.heroText}>..Welcome to Tolzy</div>
          
          <div style={styles.suggestions}>
             <span style={styles.suggestionPill}>dio located in Seattle</span>
             <span style={styles.suggestionPill}>...e is Jess and specializes in giant slalom</span>
             <span style={styles.suggestionPill}>...r rental service with a large hero image</span>
          </div>

          <div style={styles.promptBox}>
            <textarea 
              placeholder="?What desktop web experience shall we design"
              style={styles.promptInput}
            />
            <div style={styles.promptFooter}>
              <div style={styles.promptActionsLeft}>
                <Plus size={18} style={styles.icon} />
                <Mic size={18} style={styles.icon} />
                <div style={styles.modelSelector}>
                   <div style={styles.modelDot}></div>
                   <span>Pro 3.1</span>
                   <Settings size={14} />
                </div>
                <HelpCircle size={18} style={styles.icon} />
              </div>
              <div style={styles.promptActionsRight}>
                 <div style={styles.webPill}>
                    <span>الويب</span>
                    <Globe size={14} />
                 </div>
                 <div style={styles.appPill}>تطبيق</div>
                 <Plus size={18} style={styles.icon} />
              </div>
            </div>
            <div style={styles.promptSubmit}>
               <Sparkles size={18} />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Project List */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarTabs}>
            <div style={styles.activeTab}>
               <LayoutGrid size={16} />
               <span>مشاريعي</span>
            </div>
            <div style={styles.inactiveTab}>
               <span>تمت مشاركتها معي</span>
            </div>
          </div>

          <div style={styles.searchBox}>
            <Search size={16} style={styles.searchIcon} />
            <input 
              placeholder="البحث في المشروعات" 
              style={styles.searchInput}
            />
          </div>

          <div style={styles.projectList}>
             <div style={styles.sectionHeader}>الأحدث</div>
             {projects.filter(p => p.type === 'today').map(p => (
               <div key={p.id} style={styles.projectItem} onClick={onOpenProject}>
                 <div style={styles.projectInfo}>
                    <div style={styles.projectTitle}>{p.title}</div>
                    <div style={styles.projectDate}>{p.date}</div>
                 </div>
                 <div style={styles.projectThumb}></div>
               </div>
             ))}

             <div style={styles.sectionHeader}>أمس</div>
             {projects.filter(p => p.type === 'yesterday').map(p => (
               <div key={p.id} style={styles.projectItem} onClick={onOpenProject}>
                 <div style={styles.projectInfo}>
                    <div style={styles.projectTitle}>{p.title}</div>
                    <div style={styles.projectDate}>{p.date}</div>
                 </div>
                 <div style={styles.projectThumb}></div>
               </div>
             ))}

             <div style={styles.sectionHeader}>أمثلة</div>
             {projects.filter(p => p.type === 'example').map(p => (
               <div key={p.id} style={styles.projectItem} onClick={onOpenProject}>
                 <div style={styles.projectInfo}>
                    <div style={styles.projectTitle}>{p.title}</div>
                    <div style={styles.projectDate}>{p.date}</div>
                 </div>
                 <div style={styles.projectThumb}></div>
               </div>
             ))}
          </div>

          <div style={styles.sidebarFooter}>
             <Sun size={18} />
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-dark)',
  },
  topBar: {
    height: 'var(--topbar-height)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    borderBottom: '1px solid var(--border-color)',
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  menuIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#4caf50',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  navIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navLink: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    marginLeft: '8px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: '600',
    letterSpacing: '-0.5px',
  },
  betaTag: {
    fontSize: '10px',
    padding: '2px 6px',
    border: '1px solid var(--text-secondary)',
    borderRadius: '10px',
    color: 'var(--text-secondary)',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  centerArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 40px',
    position: 'relative',
  },
  heroText: {
    fontSize: '72px',
    fontWeight: '500',
    marginBottom: '20px',
    color: 'var(--text-primary)',
  },
  suggestions: {
    display: 'flex',
    gap: '10px',
    marginBottom: '40px',
  },
  suggestionPill: {
    padding: '8px 16px',
    backgroundColor: 'var(--pill-bg)',
    borderRadius: '20px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
  },
  promptBox: {
    width: '100%',
    maxWidth: '800px',
    backgroundColor: 'var(--bg-sidebar)',
    borderRadius: '16px',
    border: '1px solid var(--border-color)',
    padding: '16px',
    position: 'relative',
  },
  promptInput: {
    width: '100%',
    minHeight: '120px',
    resize: 'none',
    fontSize: '16px',
    color: 'var(--text-primary)',
    textAlign: 'left',
  },
  promptFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '12px',
  },
  promptActionsLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  promptActionsRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  icon: {
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  modelSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--bg-panel)',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
  },
  modelDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#ffb300',
  },
  webPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--pill-bg)',
    padding: '6px 14px',
    borderRadius: '14px',
    fontSize: '12px',
    color: 'var(--text-primary)',
  },
  appPill: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  promptSubmit: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    color: 'var(--text-secondary)',
  },
  sidebar: {
    width: 'var(--sidebar-width)',
    backgroundColor: 'var(--bg-sidebar)',
    borderLeft: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
  },
  sidebarTabs: {
    display: 'flex',
    backgroundColor: 'var(--bg-panel)',
    borderRadius: '10px',
    padding: '4px',
    marginBottom: '16px',
  },
  activeTab: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    backgroundColor: 'var(--bg-sidebar)',
    borderRadius: '8px',
    padding: '8px',
    fontSize: '13px',
    color: 'var(--text-primary)',
    fontWeight: '500',
  },
  inactiveTab: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  searchBox: {
    position: 'relative',
    marginBottom: '20px',
  },
  searchIcon: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-secondary)',
  },
  searchInput: {
    width: '100%',
    backgroundColor: 'var(--bg-panel)',
    padding: '10px 36px 10px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    textAlign: 'right',
  },
  projectList: {
    flex: 1,
    overflowY: 'auto',
    textAlign: 'right',
  },
  sectionHeader: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginBottom: '12px',
    marginTop: '20px',
  },
  projectItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'background 0.2s',
    '&:hover': {
      backgroundColor: 'var(--bg-panel)',
    },
  },
  projectInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  projectTitle: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  projectDate: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  projectThumb: {
    width: '40px',
    height: '40px',
    backgroundColor: 'var(--bg-panel)',
    borderRadius: '6px',
    marginLeft: '12px',
    border: '1px solid var(--border-color)',
  },
  sidebarFooter: {
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '10px 0',
    color: 'var(--text-secondary)',
  }
}

export default Dashboard
