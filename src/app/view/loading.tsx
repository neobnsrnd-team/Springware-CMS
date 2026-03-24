// src/app/view/loading.tsx

export default function ViewLoading() {
    return (
        <div style={{ background: '#dde1e7', minHeight: '100vh', padding: '40px 0 80px' }}>
            <div
                className="is-container"
                style={{
                    maxWidth: '390px',
                    margin: '0 auto',
                    width: '100%',
                    background: '#ffffff',
                    minHeight: '700px',
                    boxShadow: '0 8px 48px rgba(0,70,164,0.10)',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <div
                        style={{
                            width: '48px',
                            height: '48px',
                            border: '2px solid transparent',
                            borderBottomColor: '#2563eb',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto',
                        }}
                    />
                    <p style={{ marginTop: '16px', color: '#6b7280' }}>미리보기 로딩 중...</p>
                </div>
            </div>
        </div>
    );
}
