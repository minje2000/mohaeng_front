export default function Footer() {
  return (
    <footer
      style={{
        width: '100%',
        background: '#fff',
        color: '#111',
        borderTop: '1px solid rgba(0,0,0,0.1)',
        boxSizing: 'border-box',
        flexShrink: 0,
        padding: '30px 50px',
      }}
    >
      <div
        style={{
          textAlign: 'left',
          lineHeight: '1.8',
          fontSize: '14px',
        }}
      >
        <div style={{ fontWeight: 700 }}>모행</div>
        <div>개발팀 : 풀풀(poolpool)</div>
        <div>서비스 이용문의 : mohaeng8826@gmail.com</div>
        <div>
          모행은 통신판매중개자이며 행사에 대한 당사자 및 주최자가 아닙니다. 따라서
          모행은 등록된 행사에 대해 책임지지 않습니다.
        </div>
        <div>© 2026 MOHAENG. All rights reserved.</div>
      </div>
    </footer>
  );
}