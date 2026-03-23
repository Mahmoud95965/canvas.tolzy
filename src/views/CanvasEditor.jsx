import React from 'react'
import { 
  ArrowLeft, 
  Menu, 
  Share2, 
  Download, 
  Play, 
  Plus, 
  Mic, 
  Settings, 
  HelpCircle, 
  Sun,
  LayoutGrid,
  MoreVertical,
  MousePointer2,
  PenTool,
  Hand,
  Layers,
  Search,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Command
} from 'lucide-react'

const CanvasEditor = ({ onBack }) => {
  return (
    <div style={styles.container}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <div style={styles.projectTitle}>Tolzy Canvas Editor</div>
          <button style={styles.iconButton}><Menu size={18} /></button>
        </div>
        
        <div style={styles.topBarRight}>
          <div style={styles.avatar}>M</div>
          <button style={styles.actionButton}>
            <Share2 size={16} />
            مشاركة
          </button>
          <button style={styles.actionButton}>
            <Download size={16} />
            تصدير
          </button>
          <button style={styles.playButton}>
            <Play size={16} fill="white" />
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div style={styles.workspace}>
        {/* Left Agent Log Panel */}
        <div style={styles.agentLog}>
          <div style={styles.logHeader}>
             <Plus size={16} />
             <span>Agent log</span>
          </div>
          
          <div style={styles.logCard}>
            <div style={styles.logCardHeader}>
              <button style={styles.logMenuBtn}><MoreVertical size={14} /></button>
              <div style={styles.logCardTitle}>
                 <LayoutGrid size={14} />
                 <span>...لقطة شاشة تفصيلية للوحة تحكم</span>
              </div>
            </div>
            
            <div style={styles.logContent}>
              <div style={styles.arabicText}>
                لقطة شاشة تفصيلية للوحة تحكم (dashboard) لشركة Tolzy AI. تعتمد على واجهة مستنبطة من منصة Google Stitch وتقدم إحصائيات دقيقة عن الأداء والنمو. الواجهة مصممة بأسلوب عصري وأنيق مع استخدام ألوان احترافية وتناسق بصري مريح.
              </div>
              <div style={styles.tagRow}>
                <span style={styles.tag}>...h.console.query</span>
                <Globe size={12} />
              </div>

               <div style={{ ...styles.arabicText, marginTop: '12px' }}>
                تتضمن الواجهة رسومًا بيانية تفصيلية توضح عدد مرات الظهور (Impressions) والنقرات (Clicks)، مع إمكانية التفاعل مع كل قسم للحصول على بيانات أكثر دقة.
              </div>
              
              <div style={styles.statusRow}>
                 <div style={styles.statusItem}>
                   <CheckCircle2 size={14} color="#4caf50" />
                   <span>...لقطة شاشة تفصيلية للوحة تحكم</span>
                 </div>
                 <div style={styles.statusItem}>
                   <CheckCircle2 size={14} color="#4caf50" />
                   <span>Role: Act as a Senior UI/UX D...</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Area (Dot Grid) */}
        <div style={styles.editorArea}>
          {/* Mock Canvas Elements */}
          <div style={styles.canvasElement}>
             <img 
               src="https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=400" 
               alt="Mock Dashboard" 
               style={styles.mockImage}
             />
          </div>
        </div>

        {/* Right Toolbar */}
        <div style={styles.toolbar}>
          <button style={styles.toolBtn}><MousePointer2 size={18} /></button>
          <button style={styles.toolBtn}><PenTool size={18} /></button>
          <button style={styles.toolBtn}><Hand size={18} /></button>
          <button style={styles.toolBtn}><Layers size={18} /></button>
          <button style={styles.toolBtn}><Search size={18} /></button>
          <button style={styles.toolBtn}><MoreVertical size={18} /></button>
        </div>

        {/* Bottom Prompter */}
        <div style={styles.bottomPrompter}>
           <div style={styles.pillRow}>
              <div style={styles.pill}>
                <span>2</span>
                <span>...efine' model for the canvas window</span>
              </div>
              <div style={styles.pill}>
                <span>1</span>
                <span>...t selection dropdown to the top bar</span>
              </div>
           </div>

           <div style={styles.promptContainer}>
             <input 
               type="text" 
               placeholder="?What would you like to change or create"
               style={styles.promptInput}
             />
             <div style={styles.promptActions}>
               <ArrowLeft size={18} style={styles.icon} />
               <div style={styles.divider}></div>
               <Mic size={18} style={styles.icon} />
               <div style={styles.divider}></div>
               <div style={styles.modelTag}>
                  <div style={styles.amberDot}></div>
                  <span>Pro 3.1</span>
                  <ChevronDown size={14} />
               </div>
               <Sparkles size={18} style={styles.sparkleIcon} />
               <div style={styles.rightActions}>
                 <Plus size={18} style={styles.icon} />
                 <LayoutGrid size={18} style={styles.icon} />
               </div>
             </div>
           </div>
        </div>

        {/* Footer Controls */}
        <div style={styles.footerControls}>
           <button style={styles.footerBtn}><HelpCircle size={18} /></button>
           <button style={styles.footerBtn}><Sun size={18} /></button>
           <div style={styles.zoomControl}>
              <span>70%</span>
              <Command size={14} />
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
    backgroundColor: '#111',
    color: '#eee',
    position: 'relative',
    overflow: 'hidden'
  },
  topBar: {
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    backgroundColor: 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #333',
    zIndex: 10
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  projectTitle: {
    fontSize: '14px',
    fontWeight: '500'
  },
  iconButton: {
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222'
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#4caf50',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    borderRadius: '16px',
    backgroundColor: '#222',
    fontSize: '12px',
    fontWeight: '500',
    border: '1px solid #333'
  },
  playButton: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    border: '1px solid #333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  workspace: {
    flex: 1,
    display: 'flex',
    position: 'relative',
    backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
    backgroundSize: '24px 24px',
  },
  agentLog: {
    width: '320px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    zIndex: 5
  },
  logHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#888',
    fontSize: '12px',
    padding: '4px 8px'
  },
  logCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    border: '1px solid #333',
    overflow: 'hidden'
  },
  logCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderBottom: '1px solid #222',
    backgroundColor: '#222'
  },
  logCardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#888'
  },
  logMenuBtn: {
    color: '#666'
  },
  logContent: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  arabicText: {
    direction: 'rtl',
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#ddd'
  },
  tagRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 8px',
    backgroundColor: '#2a2a2a',
    borderRadius: '12px',
    fontSize: '11px',
    color: '#888',
    alignSelf: 'flex-start'
  },
  statusRow: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#aaa',
    padding: '6px 10px',
    backgroundColor: '#111',
    borderRadius: '8px',
    border: '1px solid #222'
  },
  editorArea: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  canvasElement: {
    padding: '12px',
    backgroundColor: '#222',
    borderRadius: '8px',
    border: '1px solid #333',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
  },
  mockImage: {
    width: '400px',
    borderRadius: '4px'
  },
  toolbar: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '4px',
    backgroundColor: 'rgba(30,30,30,0.8)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid #333',
    zIndex: 10
  },
  toolBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#888',
    '&:hover': {
      backgroundColor: '#333'
    }
  },
  bottomPrompter: {
    position: 'absolute',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '600px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    zIndex: 20
  },
  pillRow: {
    display: 'flex',
    gap: '12px'
  },
  pill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    backgroundColor: 'rgba(30,30,30,0.9)',
    borderRadius: '16px',
    border: '1px solid #333',
    fontSize: '11px',
    color: '#aaa'
  },
  promptContainer: {
    width: '100%',
    backgroundColor: 'rgba(20,20,20,0.9)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: '1px solid #333',
    padding: '8px 16px',
    display: 'flex',
    flexDirection: 'column',
  },
  promptInput: {
    width: '100%',
    padding: '12px 0',
    fontSize: '14px',
    color: '#fff',
  },
  promptActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '4px'
  },
  icon: {
    color: '#666',
    cursor: 'pointer'
  },
  divider: {
    width: '1px',
    height: '16px',
    backgroundColor: '#333'
  },
  modelTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#222',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '11px',
    border: '1px solid #333'
  },
  amberDot: {
    width: '6px',
    height: '6px',
    borderRadius: '4px',
    backgroundColor: '#ffb300'
  },
  sparkleIcon: {
    color: '#aaa'
  },
  rightActions: {
    marginLeft: 'auto',
    display: 'flex',
    gap: '12px'
  },
  footerControls: {
    position: 'absolute',
    bottom: '16px',
    right: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  footerBtn: {
    color: '#666'
  },
  zoomControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#222',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#888',
    border: '1px solid #333'
  }
}

export default CanvasEditor
