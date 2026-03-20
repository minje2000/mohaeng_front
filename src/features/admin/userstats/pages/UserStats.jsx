// src/features/admin/userstats/pages/UserStats.jsx
import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Legend,
} from 'recharts';
import { UserStatsApi } from '../api/UserStatsApi';

const fmt = (n) => (n == null ? '-' : Number(n).toLocaleString());

function StatCard({ label, value, unit, color = '#111', icon }) {
  return (
    <div style={{
      flex: 1, border: '1px solid #E5E7EB', borderRadius: 14,
      padding: '20px 22px', background: '#FAFAFA',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 30, fontWeight: 900, color }}>
        {fmt(value)}
        <span style={{ fontSize: 14, marginLeft: 4, color: '#9CA3AF', fontWeight: 600 }}>{unit}</span>
      </div>
    </div>
  );
}

// 월별 누적 회원 수 전용 툴팁
function MonthlyUserTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10,
      padding: '10px 14px', fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: '#374151' }}>{label}</div>
      <div style={{ color: '#1D4ED8', fontWeight: 600, marginBottom: 6 }}>
        누적 회원 수: {fmt(d?.userCount)}명
      </div>
      <div style={{ color: '#059669', fontWeight: 700 }}>
        + {fmt(d?.newUserCount)}
      </div>
      <div style={{ color: '#DC2626', fontWeight: 700 }}>
        - {fmt(d?.monthlyWithdrawalCount)}
      </div>
    </div>
  );
}

// 휴면계정 차트 전용 툴팁
function DormantTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10,
      padding: '10px 14px', fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: '#374151' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {fmt(p.value)}건
        </div>
      ))}
    </div>
  );
}

const currentYear  = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function UserStats() {
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [monthlyUsers, setMonthlyUsers] = useState([]);

  const [filterYear, setFilterYear]   = useState(currentYear);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [dormantHandle, setDormantHandle]   = useState([]);
  const [dormantLoading, setDormantLoading] = useState(false);

  const [graphYear, setGraphYear]         = useState(currentYear);
  const [yearlyDormant, setYearlyDormant] = useState([]);
  const [yearlyLoading, setYearlyLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    UserStatsApi.getOperateStats()
      .then(res => {
        const data = res.data?.data || res.data;
        setDashboard(data.dashboardStats || {});
        setMonthlyUsers(data.monthlyUsers || []);
      })
      .catch(() => setError('데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setDormantLoading(true);
    UserStatsApi.getDormantHandleByMonth(filterYear, filterMonth)
      .then(res => {
        const raw = res.data?.data || res.data || [];
        setDormantHandle(raw.filter(r =>
          (r.dormantNotifiedCount || 0) + (r.dormantWithdrawnCount || 0) > 0
        ));
      })
      .catch(e => console.error('휴면 일별 로딩 실패', e))
      .finally(() => setDormantLoading(false));
  }, [filterYear, filterMonth]);

  useEffect(() => {
    setYearlyLoading(true);
    const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
    Promise.all(
      months.map(m =>
        UserStatsApi.getDormantHandleByMonth(graphYear, m)
          .then(res => {
            const raw = res.data?.data || res.data || [];
            const notified  = raw.reduce((s, r) => s + (r.dormantNotifiedCount  || 0), 0);
            const withdrawn = raw.reduce((s, r) => s + (r.dormantWithdrawnCount || 0), 0);
            return { period: `${graphYear}-${m}`, dormantNotifiedCount: notified, dormantWithdrawnCount: withdrawn };
          })
          .catch(() => ({ period: `${graphYear}-${m}`, dormantNotifiedCount: 0, dormantWithdrawnCount: 0 }))
      )
    ).then(results => setYearlyDormant(results))
     .finally(() => setYearlyLoading(false));
  }, [graphYear]);

  const totalNotified  = dormantHandle.reduce((s, r) => s + (r.dormantNotifiedCount  || 0), 0);
  const totalWithdrawn = dormantHandle.reduce((s, r) => s + (r.dormantWithdrawnCount || 0), 0);
  const totalAction    = totalNotified + totalWithdrawn;

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF' }}>⏳ 불러오는 중...</div>;
  if (error)   return <div style={{ padding: 60, textAlign: 'center', color: '#EF4444' }}>{error}</div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 900 }}>운영 통계</h2>

      {/* ── 1. 현황 요약 카드 ── */}
      <section style={sectionStyle}>
        <h3 style={sectionTitleStyle}>현황 요약</h3>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <StatCard label="오늘 방문자 수" value={dashboard?.todayUserCount}    unit="명" icon="👣" color="#1D4ED8" />
          <StatCard label="개인 회원 수"   value={dashboard?.personalUserCount} unit="명" icon="👤" color="#059669" />
          <StatCard label="기업 회원 수"   value={dashboard?.companyUserCount}  unit="명" icon="🏢" color="#D97706" />
          <StatCard label="휴면 계정 수"   value={dashboard?.totalDormantCount} unit="명" icon="💤" color="#DC2626" />

          {/* 탈퇴자 수 카드 */}
          <div style={{
            flex: 1, border: '1px solid #E5E7EB', borderRadius: 14,
            padding: '20px 22px', background: '#FAFAFA',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🚪</span>
              <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>탈퇴자 수</span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, color: '#374151' }}>
              {fmt(dashboard?.totalWithdrawalCount)}
              <span style={{ fontSize: 14, marginLeft: 4, color: '#9CA3AF', fontWeight: 600 }}>명</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 0 }}>
              <div style={{
                flex: 1, background: '#FEE2E2', borderRadius: 8, padding: '6px 10px',
                display: 'flex', flexDirection: 'column', gap: 2,
              }}>
                <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 700, whiteSpace: 'nowrap' }}>직접 탈퇴</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#991B1B', whiteSpace: 'nowrap' }}>
                  {fmt(dashboard?.directWithdrawalCount)}
                  <span style={{ fontSize: 11, marginLeft: 2, color: '#DC2626', fontWeight: 600 }}>명</span>
                </span>
              </div>
              <div style={{
                flex: 1, background: '#FEF3C7', borderRadius: 8, padding: '6px 10px',
                display: 'flex', flexDirection: 'column', gap: 2,
              }}>
                <span style={{ fontSize: 11, color: '#D97706', fontWeight: 700, whiteSpace: 'nowrap' }}>휴면 탈퇴</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#92400E', whiteSpace: 'nowrap' }}>
                  {fmt(dashboard?.dormantWithdrawalCount)}
                  <span style={{ fontSize: 11, marginLeft: 2, color: '#D97706', fontWeight: 600 }}>명</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. 월별 누적 회원 수 ── */}
      <section style={{ ...sectionStyle, marginTop: 20 }}>
        <h3 style={sectionTitleStyle}>최근 6개월 월별 누적 회원 수</h3>
        {monthlyUsers.length === 0 ? (
          <div style={emptyStyle}>데이터 없음</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyUsers} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<MonthlyUserTooltip />} />
              <Line type="monotone" dataKey="userCount" name="누적 회원 수"
                stroke="#1D4ED8" strokeWidth={2.5} dot={{ r: 5, fill: '#1D4ED8' }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* ── 3. 연간 휴면계정 그래프 ── */}
      <section style={{ ...sectionStyle, marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ ...sectionTitleStyle, marginBottom: 0 }}>휴면계정 연간 조치 현황</h3>
          <select value={graphYear} onChange={e => setGraphYear(Number(e.target.value))} style={selectStyle}>
            {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}년</option>)}
          </select>
        </div>
        {yearlyLoading ? (
          <div style={emptyStyle}>불러오는 중...</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={yearlyDormant} barSize={20} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<DormantTooltip />} />
              <Legend wrapperStyle={{ fontSize: 13, fontWeight: 600 }} />
              <Bar dataKey="dormantNotifiedCount" name="안내 발송" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="dormantWithdrawnCount" name="탈퇴 처리" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* ── 4. 휴면계정 조치 동향 (일별 표) ── */}
      <section style={{ ...sectionStyle, marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ ...sectionTitleStyle, marginBottom: 0 }}>휴면계정 조치 동향</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))} style={selectStyle}>
              {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}년</option>)}
            </select>
            <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))} style={selectStyle}>
              {MONTH_OPTIONS.map(m => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}월</option>
              ))}
            </select>
          </div>
        </div>

        {dormantLoading ? (
          <div style={emptyStyle}>불러오는 중...</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
              <StatCard
                label={`${filterYear}년 ${String(filterMonth).padStart(2,'0')}월 총 안내 발송`}
                value={totalNotified} unit="건" icon="📧" color="#D97706"
              />
              <StatCard
                label={`${filterYear}년 ${String(filterMonth).padStart(2,'0')}월 총 탈퇴 처리`}
                value={totalWithdrawn} unit="건" icon="🚪" color="#DC2626"
              />
              <StatCard
                label={`${filterYear}년 ${String(filterMonth).padStart(2,'0')}월 총 조치`}
                value={totalAction} unit="건" icon="📋" color="#111"
              />
            </div>
            {dormantHandle.length === 0 ? (
              <div style={emptyStyle}>
                {filterYear}년 {String(filterMonth).padStart(2, '0')}월 조치 데이터 없음
              </div>
            ) : (
              <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                      {['날짜', '안내 발송 수', '탈퇴 처리 수', '총 조치 수'].map(h => (
                        <th key={h} style={{ textAlign: 'center', padding: '10px 16px',
                          fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dormantHandle.map((row, i) => {
                      const total = (row.dormantNotifiedCount || 0) + (row.dormantWithdrawnCount || 0);
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #F1F5F9',
                          background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                          <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700, color: '#374151' }}>
                            {row.period}
                          </td>
                          <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                            <span style={{ background: '#FEF3C7', color: '#92400E',
                              padding: '3px 10px', borderRadius: 999, fontWeight: 700 }}>
                              {fmt(row.dormantNotifiedCount)}건
                            </span>
                          </td>
                          <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                            <span style={{ background: '#FEE2E2', color: '#991B1B',
                              padding: '3px 10px', borderRadius: 999, fontWeight: 700 }}>
                              {fmt(row.dormantWithdrawnCount)}건
                            </span>
                          </td>
                          <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 900, color: '#111' }}>
                            {fmt(total)}건
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#F1F5F9', borderTop: '2px solid #E5E7EB' }}>
                      <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 900, color: '#374151' }}>합계</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 900 }}>{fmt(totalNotified)}건</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 900 }}>{fmt(totalWithdrawn)}건</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 900, color: '#111' }}>{fmt(totalAction)}건</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

const sectionStyle = {
  background: '#fff', border: '1px solid #E5E7EB',
  borderRadius: 14, padding: '20px 22px',
};
const sectionTitleStyle = {
  margin: '0 0 16px', fontSize: 15, fontWeight: 900,
  borderLeft: '4px solid #111', paddingLeft: 10, color: '#111',
};
const selectStyle = {
  padding: '7px 12px', borderRadius: 8, border: '1px solid #E5E7EB',
  fontSize: 13, fontWeight: 600, color: '#374151', background: '#fff',
  cursor: 'pointer', outline: 'none',
};
const emptyStyle = {
  height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#9CA3AF', fontSize: 14,
};
