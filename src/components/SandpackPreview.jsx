'use client';
import React from 'react';
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview as SandpackPreviewPanel,
  SandpackLayout,
} from '@codesandbox/sandpack-react';
import { Code, Eye, Sparkles } from 'lucide-react';

const SandpackPreviewComponent = ({ files, dependencies }) => {
  const [activeTab, setActiveTab] = React.useState('preview');
  const hasFiles = files && Object.keys(files).length > 0;

  if (!hasFiles) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: '16px', color: 'var(--text-muted)',
        background: 'rgba(5,5,10,0.4)', borderRadius: '16px',
        margin: '12px', border: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(99,102,241,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pulse 3s ease-in-out infinite',
          boxShadow: '0 0 40px rgba(99,102,241,0.15)'
        }}>
          <Sparkles size={28} color="#6366f1" />
        </div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
          أدخل وصفاً لتوليد مكوّن React
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', maxWidth: '360px', textAlign: 'center', lineHeight: 1.7 }}>
          الكود سيظهر هنا مع معاينة حية — يمكنك التعديل مباشرة
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      borderRadius: '16px', overflow: 'hidden', margin: '12px',
      border: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(5,5,10,0.4)',
    }}>
      {/* Tab Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: '8px 12px',
        background: 'rgba(8,8,14,0.8)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <button
          onClick={() => setActiveTab('preview')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', borderRadius: '10px',
            fontSize: '12px', fontWeight: 700,
            background: activeTab === 'preview' ? 'rgba(16,185,129,0.15)' : 'transparent',
            color: activeTab === 'preview' ? '#10b981' : 'rgba(255,255,255,0.4)',
            border: activeTab === 'preview' ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
            transition: 'all 0.2s', cursor: 'pointer',
          }}
        >
          <Eye size={13} /> معاينة
        </button>
        <button
          onClick={() => setActiveTab('code')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', borderRadius: '10px',
            fontSize: '12px', fontWeight: 700,
            background: activeTab === 'code' ? 'rgba(99,102,241,0.15)' : 'transparent',
            color: activeTab === 'code' ? '#818cf8' : 'rgba(255,255,255,0.4)',
            border: activeTab === 'code' ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
            transition: 'all 0.2s', cursor: 'pointer',
          }}
        >
          <Code size={13} /> الكود
        </button>
        <button
          onClick={() => setActiveTab('split')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', borderRadius: '10px',
            fontSize: '12px', fontWeight: 700,
            background: activeTab === 'split' ? 'rgba(168,85,247,0.15)' : 'transparent',
            color: activeTab === 'split' ? '#a855f7' : 'rgba(255,255,255,0.4)',
            border: activeTab === 'split' ? '1px solid rgba(168,85,247,0.3)' : '1px solid transparent',
            transition: 'all 0.2s', cursor: 'pointer',
          }}
        >
          <Eye size={13} /> تقسيم
        </button>
      </div>

      {/* Sandpack */}
      <div style={{ flex: 1, direction: 'ltr' }}>
        <SandpackProvider
          template="react"
          files={files}
          customSetup={{
            dependencies: dependencies || {}
          }}
          theme="dark"
          options={{
            externalResources: ['https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'],
          }}
        >
          <SandpackLayout
            style={{
              height: '100%',
              border: 'none',
              borderRadius: 0,
              background: 'transparent',
            }}
          >
            {(activeTab === 'code' || activeTab === 'split') && (
              <SandpackCodeEditor
                showTabs
                showLineNumbers
                showInlineErrors
                wrapContent
                style={{
                  height: '100%',
                  flex: activeTab === 'split' ? 1 : 1,
                  minWidth: 0,
                }}
              />
            )}
            {(activeTab === 'preview' || activeTab === 'split') && (
              <SandpackPreviewPanel
                showNavigator
                showRefreshButton
                style={{
                  height: '100%',
                  flex: activeTab === 'split' ? 1 : 1,
                  minWidth: 0,
                }}
              />
            )}
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </div>
  );
};

export default SandpackPreviewComponent;
