import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DeadlineCalendar({ projects = [] }) {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  const todayDate = today.getDate();

  // Map projects to calendar dates
  const projectsByDate = useMemo(() => {
    const map = {};
    projects.forEach(project => {
      const deadline = new Date(project.deadline);
      if (deadline.getMonth() === month && deadline.getFullYear() === year) {
        const date = deadline.getDate();
        if (!map[date]) map[date] = [];
        map[date].push(project);
      }
    });
    return map;
  }, [projects, month, year]);

  // Get risk color for a project
  const getRiskColor = (project) => {
    const daysRemaining = Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (project.status === 'delayed' || project.daysBehind > 2) {
      return 'red';
    } else if (daysRemaining <= 3 || project.daysBehind > 0) {
      return 'yellow';
    } else {
      return 'green';
    }
  };

  // Get glow color classes
  const getGlowClasses = (color) => {
    if (color === 'red') {
      return 'bg-red-500/20 border-red-400/40 shadow-lg shadow-red-500/50';
    } else if (color === 'yellow') {
      return 'bg-yellow-500/20 border-yellow-400/40 shadow-lg shadow-yellow-500/50';
    } else {
      return 'bg-emerald-500/20 border-emerald-400/40 shadow-lg shadow-emerald-500/50';
    }
  };

  // Generate calendar days
  const calendarDays = [];
  
  // Empty cells before first day
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push({ date: null, projects: [] });
  }
  
  // Days of the month
  for (let date = 1; date <= daysInMonth; date++) {
    calendarDays.push({
      date,
      projects: projectsByDate[date] || [],
      isToday: isCurrentMonth && date === todayDate,
    });
  }

  // Month navigation
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // AI Insight
  const aiInsight = useMemo(() => {
    const upcomingDeadlines = projects.filter(p => {
      const daysRemaining = Math.ceil((new Date(p.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      return daysRemaining >= 0 && daysRemaining <= 7;
    });

    const riskyProjects = upcomingDeadlines.filter(p => 
      p.status === 'delayed' || p.daysBehind > 0
    );

    if (riskyProjects.length > 0) {
      return {
        text: `AI detected deadline risk for ${riskyProjects.length} project${riskyProjects.length > 1 ? 's' : ''}.`,
        color: 'text-red-300',
        icon: '⚠️'
      };
    } else if (upcomingDeadlines.length > 0) {
      return {
        text: `${upcomingDeadlines.length} deadline${upcomingDeadlines.length > 1 ? 's' : ''} approaching this week.`,
        color: 'text-yellow-300',
        icon: '📅'
      };
    } else {
      return {
        text: 'All projects are on track. Keep up the momentum!',
        color: 'text-emerald-300',
        icon: '✨'
      };
    }
  }, [projects]);

  return (
    <div className="bg-slate-950/70 border border-white/10 rounded-3xl overflow-hidden shadow-xl shadow-violet-900/20">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
            <span className="text-sm">📅</span>
          </div>
          <div>
            <p className="font-black text-white text-sm">Deadline Calendar</p>
            <p className="text-[10px] text-violet-300">AI-powered tracking</p>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-white/10">
        <button
          onClick={previousMonth}
          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center justify-center"
        >
          ‹
        </button>
        
        <p className="text-sm font-bold text-white">
          {monthNames[month]} {year}
        </p>
        
        <button
          onClick={nextMonth}
          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition flex items-center justify-center"
        >
          ›
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="px-5 py-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-slate-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (!day.date) {
              return <div key={i} className="aspect-square" />;
            }

            const hasDeadlines = day.projects.length > 0;
            const primaryProject = day.projects[0];
            const riskColor = hasDeadlines ? getRiskColor(primaryProject) : null;

            return (
              <div
                key={i}
                onClick={() => hasDeadlines && navigate(`/projects/${primaryProject._id}`)}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-xs font-semibold
                  transition-all duration-300 relative group
                  ${day.isToday 
                    ? 'bg-violet-500/20 border-2 border-violet-400/60 text-violet-200 shadow-lg shadow-violet-500/30' 
                    : hasDeadlines
                    ? `border ${getGlowClasses(riskColor)} text-white cursor-pointer hover:scale-110 animate-pulse`
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
                  }
                `}
              >
                {day.date}
                
                {/* Deadline indicator dot */}
                {hasDeadlines && (
                  <div className={`
                    absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full
                    ${riskColor === 'red' ? 'bg-red-400' : riskColor === 'yellow' ? 'bg-yellow-400' : 'bg-emerald-400'}
                    animate-ping
                  `} />
                )}

                {/* Hover tooltip */}
                {hasDeadlines && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-48">
                    <div className="bg-slate-900 border border-white/20 rounded-xl p-3 shadow-2xl">
                      <p className="text-xs font-bold text-white mb-1">
                        {primaryProject.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {Math.ceil((new Date(primaryProject.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days remaining
                      </p>
                      <p className={`text-[10px] font-semibold mt-1 ${
                        riskColor === 'red' ? 'text-red-300' : 
                        riskColor === 'yellow' ? 'text-yellow-300' : 
                        'text-emerald-300'
                      }`}>
                        {riskColor === 'red' ? '🔴 High Risk' : 
                         riskColor === 'yellow' ? '🟡 Medium Risk' : 
                         '🟢 On Track'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-white/10 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50" />
          <span className="text-[10px] text-slate-400">On Track</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-lg shadow-yellow-500/50" />
          <span className="text-[10px] text-slate-400">Near Deadline</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-400 shadow-lg shadow-red-500/50" />
          <span className="text-[10px] text-slate-400">At Risk</span>
        </div>
      </div>

      {/* AI Insight */}
      <div className="px-5 py-4 border-t border-white/10 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5">
        <div className="flex items-start gap-2">
          <span className="text-sm">{aiInsight.icon}</span>
          <div className="flex-1">
            <p className="text-[10px] text-violet-300 font-bold mb-1">AI INSIGHT</p>
            <p className={`text-xs ${aiInsight.color} leading-relaxed`}>
              {aiInsight.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
