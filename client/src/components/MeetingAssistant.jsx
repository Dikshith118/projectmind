import { useState } from 'react';

export default function MeetingAssistant() {
  const [projectEmail, setProjectEmail] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [emailAnalyzed, setEmailAnalyzed] = useState(false);
  
  const [meetings, setMeetings] = useState([]);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState({
    discussion: '',
    importantPoints: '',
    actionItems: '',
  });

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '',
    agenda: '',
    candidates: [], // Array of {name, email}
  });

  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');

  // Mock email data for simulation
  const mockMeetingEmails = [
    {
      from: 'arjundemo@gmail.com',
      subject: 'Weather Dashboard Backend Sync Meeting 2026-05-07',
      body: 'Time: 7:00 PM. Agenda: API progress, database issues, authentication flow. Priority: high.',
      date: '2026-05-07',
      time: '7:00 PM',
    },
    {
      from: 'arjundemo@gmail.com',
      subject: 'Weather Dashboard UI Review Meeting 2026-05-07',
      body: 'Time: 8:30 PM. Agenda: Dashboard polish, chatbot layout, feature cards. Priority: medium.',
      date: '2026-05-07',
      time: '8:30 PM',
    },
    {
      from: 'arjundemo@gmail.com',
      subject: 'Weather Dashboard Demo Planning Meeting 2026-05-08',
      body: 'Time: 9:15 PM. Agenda: Presentation flow, demo script, final testing. Priority: high.',
      date: '2026-05-08',
      time: '9:15 PM',
    },
    {
      from: 'arjundemo@gmail.com',
      subject: 'ProjectMind Sprint Planning Meeting 2026-05-09',
      body: 'Time: 6:00 PM. Agenda: Sprint goals, task distribution, timeline review. Priority: high.',
      date: '2026-05-09',
      time: '6:00 PM',
    },
  ];

  const mockMeetingNotesEmails = [
    {
      from: 'arjundemo@gmail.com',
      subject: 'Weather Dashboard Backend Sync Meeting Notes 2026-05-07',
      body: `Meeting Summary: The team discussed backend API integration progress, database schema issues, and authentication flow implementation.

Key Discussion Points:
- Backend API integration timeline needs to be accelerated
- Database schema finalized for user authentication module
- Frontend components are waiting for API endpoints
- Authentication flow requires additional security measures

Decisions Taken:
- Prioritize API completion before UI polishing
- Daily standup moved to 6 PM for better coordination
- Code review required before merging to main branch
- Use JWT tokens for authentication

Action Items:
- Complete authentication API endpoints (Backend Team, Due: Tomorrow)
- Update API documentation with new endpoints (Tech Lead, Due: Today)
- Test login flow with new authentication (QA Team, Due: Friday)
- Review database migration scripts (DevOps, Due: Tomorrow)

Deadlines Mentioned:
- API completion: Tomorrow EOD
- Documentation update: Today
- Testing completion: Friday
- Production deployment: Next Monday

Risks Identified:
- Backend API delay may impact frontend development progress
- Database migration scheduled during peak hours could cause downtime
- Authentication changes require thorough security testing

AI Recommendation: Prioritize backend API completion to unblock frontend team. Consider parallel development where possible and increase testing coverage for authentication module.`,
      date: '2026-05-07',
    },
    {
      from: 'arjundemo@gmail.com',
      subject: 'Weather Dashboard UI Review Meeting Notes 2026-05-07',
      body: `Meeting Summary: UI/UX review session covering dashboard design, component layouts, and user experience improvements.

Key Discussion Points:
- Dashboard layout needs better visual hierarchy
- Chatbot interface requires mobile optimization
- Feature cards should use consistent styling
- Color scheme needs accessibility improvements

Decisions Taken:
- Adopt glassmorphism design pattern across all components
- Use violet/fuchsia gradient as primary theme
- Implement responsive breakpoints for mobile devices
- Add dark mode as default with light mode option

Action Items:
- Redesign dashboard layout with new visual hierarchy (UI Team, Due: Wednesday)
- Optimize chatbot for mobile screens (Frontend Dev, Due: Thursday)
- Update feature cards with consistent styling (Designer, Due: Tomorrow)
- Run accessibility audit on color contrasts (QA Team, Due: Friday)

Deadlines Mentioned:
- Dashboard redesign: Wednesday
- Mobile optimization: Thursday
- Styling updates: Tomorrow
- Accessibility audit: Friday

Risks Identified:
- Design changes may require significant refactoring
- Mobile optimization could introduce new bugs
- Accessibility requirements might delay launch

AI Recommendation: Implement design changes incrementally to minimize risk. Focus on mobile-first approach and conduct user testing before final deployment.`,
      date: '2026-05-07',
    },
    {
      from: 'arjundemo@gmail.com',
      subject: 'Weather Dashboard Demo Planning Meeting Notes 2026-05-08',
      body: `Meeting Summary: Planning session for project demo and presentation preparation.

Key Discussion Points:
- Demo flow should highlight key features effectively
- Presentation script needs to be concise and impactful
- Final testing must cover all critical user journeys
- Backup plan needed for live demo failures

Decisions Taken:
- Demo duration: 10 minutes maximum
- Focus on 3 core features: AI Assistant, Task Management, Progress Analytics
- Pre-record backup demo video as safety net
- Conduct full rehearsal 24 hours before actual demo

Action Items:
- Create demo script with timing markers (Product Manager, Due: Tomorrow)
- Record backup demo video (Marketing Team, Due: Thursday)
- Conduct end-to-end testing (QA Team, Due: Wednesday)
- Prepare presentation slides (Design Team, Due: Tomorrow)

Deadlines Mentioned:
- Demo script: Tomorrow
- Backup video: Thursday
- Testing completion: Wednesday
- Presentation slides: Tomorrow
- Full rehearsal: Day before demo

Risks Identified:
- Live demo could fail due to technical issues
- Network connectivity problems during presentation
- Time constraints may force rushing through features

AI Recommendation: Prioritize stability over new features for demo. Use pre-recorded segments for complex workflows and ensure all team members know their roles during presentation.`,
      date: '2026-05-08',
    },
  ];

  // Parse meeting email subject to extract details
  const parseMeetingEmail = (email) => {
    const subjectParts = email.subject.split(' Meeting ');
    const projectAndTitle = subjectParts[0];
    const dateStr = subjectParts[1];
    
    // Extract project name (first words before last word which is likely the meeting type)
    const words = projectAndTitle.split(' ');
    const projectName = words.slice(0, -2).join(' ') || words[0];
    const meetingType = words.slice(-2).join(' ');
    
    // Extract priority from body
    const priorityMatch = email.body.match(/Priority:\s*(high|medium|low)/i);
    const priority = priorityMatch ? priorityMatch[1].toLowerCase() : 'medium';
    
    // Extract agenda from body
    const agendaMatch = email.body.match(/Agenda:\s*([^.]+)/i);
    const agenda = agendaMatch ? agendaMatch[1].trim() : 'No agenda provided';
    
    return {
      id: Date.now() + Math.random(),
      title: meetingType,
      date: dateStr,
      time: email.time,
      agenda: agenda,
      priority: priority,
      projectName: projectName,
      status: 'upcoming',
      attendance: null,
      source: 'email',
    };
  };

  // Analyze meeting emails
  const handleAnalyzeMeetingEmails = () => {
    if (!projectEmail) {
      showToast('⚠️ Please enter your project work email', 'warning');
      return;
    }

    if (!projectEmail.includes('@gmail.com')) {
      showToast('⚠️ Please enter a valid Gmail address', 'warning');
      return;
    }

    setIsAnalyzing(true);
    showToast('🔍 Analyzing meeting emails...', 'info');

    // Simulate email fetching delay
    setTimeout(() => {
      // Filter emails for the entered email address
      const relevantEmails = mockMeetingEmails.filter(
        email => email.from.toLowerCase() === projectEmail.toLowerCase()
      );

      if (relevantEmails.length === 0) {
        showToast('⚠️ No meeting emails found for this address', 'warning');
        setIsAnalyzing(false);
        return;
      }

      // Parse emails into meetings
      const extractedMeetings = relevantEmails.map(parseMeetingEmail);
      
      setMeetings(extractedMeetings);
      setEmailAnalyzed(true);
      setIsAnalyzing(false);
      showToast(`✅ Found ${extractedMeetings.length} upcoming meetings!`, 'success');
    }, 2000);
  };

  // Find matching meeting notes email
  const findMeetingNotesEmail = (meeting) => {
    // Try to find exact match by project name, meeting title, and date
    const matchingNotes = mockMeetingNotesEmails.find(notesEmail => {
      const notesSubject = notesEmail.subject.toLowerCase();
      const meetingTitle = meeting.title.toLowerCase();
      const meetingDate = meeting.date;
      const projectName = meeting.projectName?.toLowerCase() || '';
      
      return (
        notesSubject.includes(meetingTitle) &&
        notesSubject.includes(meetingDate) &&
        (projectName ? notesSubject.includes(projectName) : true)
      );
    });
    
    return matchingNotes;
  };

  // Generate AI summary from meeting notes email
  const generateAISummaryFromEmail = (notesEmail) => {
    const body = notesEmail.body;
    
    // Extract sections from email body
    const extractSection = (sectionName) => {
      const regex = new RegExp(`${sectionName}:([\\s\\S]*?)(?=\\n\\n[A-Z]|$)`, 'i');
      const match = body.match(regex);
      return match ? match[1].trim() : '';
    };
    
    const keyPointsText = extractSection('Key Discussion Points');
    const decisionsText = extractSection('Decisions Taken');
    const actionItemsText = extractSection('Action Items');
    const risksText = extractSection('Risks Identified');
    const recommendationText = extractSection('AI Recommendation');
    
    // Parse into arrays
    const parseListItems = (text) => {
      return text
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim());
    };
    
    const keyPoints = parseListItems(keyPointsText);
    const decisions = parseListItems(decisionsText);
    const risks = parseListItems(risksText);
    
    // Parse action items with assignee and deadline
    const actionItems = parseListItems(actionItemsText).map(item => {
      const match = item.match(/^(.*?)\s*\((.*?),\s*Due:\s*(.*?)\)$/);
      if (match) {
        return {
          task: match[1].trim(),
          assignee: match[2].trim(),
          deadline: match[3].trim(),
        };
      }
      return { task: item, assignee: 'Not assigned', deadline: 'No deadline' };
    });
    
    return {
      keyPoints: keyPoints.length > 0 ? keyPoints : ['Meeting notes processed successfully'],
      decisions: decisions.length > 0 ? decisions : ['No specific decisions recorded'],
      actionItems: actionItems.length > 0 ? actionItems : [
        { task: 'Follow up on meeting outcomes', assignee: 'Team', deadline: 'Next week' }
      ],
      risks: risks.length > 0 ? risks : ['No risks identified'],
      aiRecommendation: recommendationText || 'Continue with planned activities and monitor progress.',
    };
  };

  const showToast = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  };

  const handleAttendance = (meetingId, willAttend) => {
    setMeetings(meetings.map(m => {
      if (m.id === meetingId) {
        if (willAttend) {
          showToast('✅ Attendance confirmed', 'success');
          return { ...m, attendance: 'attending', status: 'confirmed' };
        } else {
          showToast('⚠️ I\'m sorry, I\'m not able to attend this meeting.', 'warning');
          
          // Search for meeting notes email
          const notesEmail = findMeetingNotesEmail(m);
          
          if (notesEmail) {
            // Simulate AI processing delay
            setTimeout(() => {
              setMeetings(prev => prev.map(meeting => 
                meeting.id === meetingId 
                  ? { 
                      ...meeting, 
                      status: 'completed', 
                      aiSummary: generateAISummaryFromEmail(notesEmail),
                      notesEmailFound: true,
                    }
                  : meeting
              ));
              showToast('✅ AI summary generated from meeting notes', 'success');
            }, 3000);
            
            return { ...m, attendance: 'missed', status: 'ai-summarizing' };
          } else {
            // No meeting notes found
            setTimeout(() => {
              setMeetings(prev => prev.map(meeting => 
                meeting.id === meetingId 
                  ? { 
                      ...meeting, 
                      status: 'completed', 
                      notesEmailFound: false,
                    }
                  : meeting
              ));
              showToast('⚠️ No meeting notes were found for this missed meeting', 'warning');
            }, 2000);
            
            return { ...m, attendance: 'missed', status: 'searching-notes' };
          }
        }
      }
      return m;
    }));
  };

  const openNotesModal = (meeting) => {
    setSelectedMeeting(meeting);
    setMeetingNotes({
      discussion: meeting.notes?.discussion || '',
      importantPoints: meeting.notes?.importantPoints || '',
      actionItems: meeting.notes?.actionItems || '',
    });
    setShowNotesModal(true);
  };

  const saveNotes = () => {
    setMeetings(meetings.map(m => {
      if (m.id === selectedMeeting.id) {
        return {
          ...m,
          status: 'completed',
          notes: { ...meetingNotes }
        };
      }
      return m;
    }));
    setShowNotesModal(false);
    showToast('✅ Meeting notes saved successfully', 'success');
  };

  const addCandidate = () => {
    if (!candidateName.trim()) {
      showToast('⚠️ Please enter candidate name', 'warning');
      return;
    }
    if (!candidateEmail.trim()) {
      showToast('⚠️ Please enter candidate email', 'warning');
      return;
    }
    if (!candidateEmail.includes('@')) {
      showToast('⚠️ Please enter a valid email address', 'warning');
      return;
    }

    const newCandidate = {
      id: Date.now(),
      name: candidateName.trim(),
      email: candidateEmail.trim().toLowerCase(),
    };

    setNewMeeting({
      ...newMeeting,
      candidates: [...newMeeting.candidates, newCandidate],
    });

    setCandidateName('');
    setCandidateEmail('');
    showToast('✅ Candidate added successfully', 'success');
  };

  const removeCandidate = (candidateId) => {
    setNewMeeting({
      ...newMeeting,
      candidates: newMeeting.candidates.filter(c => c.id !== candidateId),
    });
    showToast('🗑️ Candidate removed', 'info');
  };

  const handleScheduleMeeting = (e) => {
    e.preventDefault();
    const meeting = {
      id: Date.now(),
      ...newMeeting,
      status: 'upcoming',
      attendance: null,
    };
    setMeetings([...meetings, meeting]);
    setShowScheduleModal(false);
    setNewMeeting({
      title: '',
      date: '',
      time: '',
      agenda: '',
      candidates: [],
    });
    setCandidateName('');
    setCandidateEmail('');
    showToast('✅ Meeting scheduled successfully!', 'success');
  };

  const viewSummary = (meeting) => {
    setSelectedMeeting(meeting);
    setShowSummaryModal(true);
  };

  const stats = {
    attended: meetings.filter(m => m.attendance === 'attending').length,
    missed: meetings.filter(m => m.attendance === 'missed').length,
    aiSummaries: meetings.filter(m => m.aiSummary).length,
  };



  const statusBadge = (meeting) => {
    if (meeting.status === 'completed' && meeting.attendance === 'attending') {
      return <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full font-bold">✅ Attending</span>;
    }
    if (meeting.status === 'completed' && meeting.attendance === 'missed' && meeting.aiSummary) {
      return <span className="text-xs bg-violet-500/20 text-violet-300 border border-violet-400/30 px-3 py-1 rounded-full font-bold">🤖 AI Summarized</span>;
    }
    if (meeting.status === 'completed' && meeting.attendance === 'missed' && !meeting.notesEmailFound) {
      return <span className="text-xs bg-red-500/20 text-red-300 border border-red-400/30 px-3 py-1 rounded-full font-bold">❌ No Notes Found</span>;
    }
    if (meeting.attendance === 'attending' && meeting.status === 'confirmed') {
      return <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full font-bold">✅ Attending</span>;
    }
    if (meeting.attendance === 'missed') {
      return <span className="text-xs bg-red-500/20 text-red-300 border border-red-400/30 px-3 py-1 rounded-full font-bold">❌ Missed</span>;
    }
    if (meeting.status === 'ai-summarizing') {
      return <span className="text-xs bg-violet-500/20 text-violet-300 border border-violet-400/30 px-3 py-1 rounded-full font-bold animate-pulse">🤖 AI Summarizing...</span>;
    }
    if (meeting.status === 'searching-notes') {
      return <span className="text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-400/30 px-3 py-1 rounded-full font-bold animate-pulse">🔍 Searching Notes...</span>;
    }
    return <span className="text-xs bg-slate-500/20 text-slate-300 border border-slate-400/30 px-3 py-1 rounded-full font-bold">⏳ Pending</span>;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showNotification && (
        <div className={`fixed top-6 right-6 z-50 animate-slide-in-right ${
          notificationType === 'success' ? 'bg-emerald-500/20 border-emerald-400/30' :
          notificationType === 'warning' ? 'bg-yellow-500/20 border-yellow-400/30' :
          notificationType === 'info' ? 'bg-blue-500/20 border-blue-400/30' :
          'bg-violet-500/20 border-violet-400/30'
        } border backdrop-blur-xl rounded-2xl px-6 py-4 shadow-2xl max-w-md`}>
          <p className="text-sm text-white font-medium">{notificationMessage}</p>
        </div>
      )}

      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-6xl mb-4">🤝</p>
          <h3 className="text-3xl font-black text-white mb-2">AI Meeting Assistant</h3>
          <p className="text-sm text-slate-400">
            Smart meeting workflow with AI recording, summaries, and attendance tracking
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white px-6 py-3 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-violet-500/30"
        >
          <span className="mr-2">📅</span>
          Schedule Meeting
        </button>
      </div>

      {/* Project Email Input Section */}
      <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-400/30 rounded-3xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-400/30 flex items-center justify-center text-2xl">
            📧
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-black text-white mb-1">Gmail Meeting Integration</h4>
            <p className="text-sm text-slate-300">
              Enter your project work email to automatically fetch upcoming meetings
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Project Work Email
            </label>
            <input
              type="email"
              value={projectEmail}
              onChange={(e) => setProjectEmail(e.target.value)}
              placeholder="Enter project-related Gmail address (e.g., arjundemo@gmail.com)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-400 transition"
              disabled={isAnalyzing}
            />
          </div>

          <button
            onClick={handleAnalyzeMeetingEmails}
            disabled={isAnalyzing || !projectEmail}
            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white py-3 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/30"
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Analyzing meeting emails...
              </span>
            ) : (
              <>
                <span className="mr-2">🔍</span>
                Analyze Meeting Emails
              </>
            )}
          </button>

          {emailAnalyzed && (
            <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-xl p-3">
              <p className="text-sm text-emerald-200 flex items-center gap-2">
                <span>✅</span>
                <span>Email analyzed successfully! Meetings loaded from <strong>{projectEmail}</strong></span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mini Analytics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-sm hover:bg-white/10 transition">
          <p className="text-3xl font-black text-emerald-300">{stats.attended}</p>
          <p className="text-xs text-slate-400 uppercase mt-1">Meetings Attended</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-sm hover:bg-white/10 transition">
          <p className="text-3xl font-black text-red-300">{stats.missed}</p>
          <p className="text-xs text-slate-400 uppercase mt-1">Meetings Missed</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-sm hover:bg-white/10 transition">
          <p className="text-3xl font-black text-violet-300">{stats.aiSummaries}</p>
          <p className="text-xs text-slate-400 uppercase mt-1">AI Summaries</p>
        </div>
      </div>

      {/* Meeting Timeline */}
      <div className="space-y-4">
        <h4 className="text-lg font-black text-white flex items-center gap-2">
          <span>📋</span>
          Upcoming Meetings
          {meetings.length > 0 && (
            <span className="text-xs bg-violet-500/20 text-violet-300 px-3 py-1 rounded-full font-bold">
              {meetings.length}
            </span>
          )}
        </h4>

        {meetings.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
            <p className="text-5xl mb-4">📧</p>
            <p className="text-white font-bold text-lg mb-2">No Meetings Loaded</p>
            <p className="text-slate-400 text-sm">
              Enter your project work email above and click "Analyze Meeting Emails" to fetch upcoming meetings
            </p>
          </div>
        ) : (
          meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-violet-900/20"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-white font-black text-lg">{meeting.title}</p>
                    {statusBadge(meeting)}
                  </div>
                  {meeting.projectName && (
                    <p className="text-xs text-fuchsia-300 font-bold mb-1">
                      📁 {meeting.projectName}
                    </p>
                  )}
                  <p className="text-xs text-violet-300 font-bold mb-2">
                    📅 {meeting.date} • 🕐 {meeting.time}
                  </p>
                  <p className="text-sm text-slate-400">
                    <span className="font-semibold text-slate-300">Agenda:</span> {meeting.agenda}
                  </p>
                  {meeting.source === 'email' && (
                    <p className="text-xs text-blue-300 mt-2 flex items-center gap-1">
                      <span>📧</span>
                      <span>Fetched from email</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {!meeting.attendance && meeting.status === 'upcoming' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAttendance(meeting.id, true)}
                    className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 py-3 rounded-2xl font-bold hover:bg-emerald-500/30 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    ✅ I Will Attend
                  </button>
                  <button
                    onClick={() => handleAttendance(meeting.id, false)}
                    className="bg-red-500/20 border border-red-400/30 text-red-300 py-3 rounded-2xl font-bold hover:bg-red-500/30 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    ❌ Can't Attend
                  </button>
                </div>
              )}

              {/* Enter Notes Button - for attended meetings */}
              {meeting.attendance === 'attending' && meeting.status === 'confirmed' && (
                <button
                  onClick={() => openNotesModal(meeting)}
                  className="w-full bg-blue-500/20 border border-blue-400/30 text-blue-300 py-3 rounded-2xl font-bold hover:bg-blue-500/30 transition-all mt-3"
                >
                  <span className="mr-2">📝</span>
                  Enter Meeting Notes
                </button>
              )}

              {/* View Notes Button - for completed attended meetings */}
              {meeting.notes && meeting.attendance === 'attending' && (
                <button
                  onClick={() => openNotesModal(meeting)}
                  className="w-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 py-3 rounded-2xl font-bold hover:bg-emerald-500/30 transition-all mt-3"
                >
                  <span className="mr-2">📄</span>
                  View Meeting Notes
                </button>
              )}

              {/* View AI Summary Button - for missed meetings with notes found */}
              {meeting.aiSummary && meeting.attendance === 'missed' && (
                <button
                  onClick={() => viewSummary(meeting)}
                  className="w-full bg-violet-500/20 border border-violet-400/30 text-violet-300 py-3 rounded-2xl font-bold hover:bg-violet-500/30 transition-all mt-3"
                >
                  <span className="mr-2">🤖</span>
                  View AI Summary
                </button>
              )}

              {/* No Notes Found Message */}
              {meeting.attendance === 'missed' && meeting.status === 'completed' && !meeting.notesEmailFound && !meeting.aiSummary && (
                <div className="mt-4 bg-red-500/10 border border-red-400/20 rounded-2xl p-4">
                  <p className="text-sm text-red-200 flex items-start gap-2">
                    <span className="text-lg">⚠️</span>
                    <span>
                      <strong>No meeting notes were found for this missed meeting.</strong>
                      <br />
                      <span className="text-xs text-red-300 mt-1 block">
                        The system searched for meeting notes emails but couldn't find a matching email for this meeting.
                      </span>
                    </span>
                  </p>
                </div>
              )}

              {/* AI Summarizing Animation */}
              {meeting.status === 'ai-summarizing' && !meeting.aiSummary && (
                <div className="mt-4 bg-violet-500/10 border border-violet-400/20 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-violet-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-violet-200 font-bold">AI is generating summary from meeting notes email...</p>
                  </div>
                  <div className="mt-3 w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-600 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                  </div>
                </div>
              )}

              {/* Searching Notes Animation */}
              {meeting.status === 'searching-notes' && (
                <div className="mt-4 bg-yellow-500/10 border border-yellow-400/20 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    <p className="text-sm text-yellow-200 font-bold">Searching for meeting notes email...</p>
                  </div>
                  <div className="mt-3 w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Schedule Meeting Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="glass-card rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-white">Schedule New Meeting</h3>
                <p className="text-sm text-slate-400 mt-1">AI will help manage attendance and summaries</p>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="w-10 h-10 rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleMeeting} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Meeting Title</label>
                <input
                  type="text"
                  required
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-400 transition"
                  placeholder="e.g., Sprint Planning"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Time</label>
                  <input
                    type="time"
                    required
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Agenda</label>
                <textarea
                  required
                  value={newMeeting.agenda}
                  onChange={(e) => setNewMeeting({ ...newMeeting, agenda: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-400 transition resize-none"
                  rows="3"
                  placeholder="What will be discussed?"
                />
              </div>

              {/* Candidates Section */}
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-3">
                  Candidates
                  {newMeeting.candidates.length > 0 && (
                    <span className="ml-2 text-xs bg-violet-500/20 text-violet-300 px-2 py-1 rounded-full">
                      {newMeeting.candidates.length}
                    </span>
                  )}
                </label>

                {/* Add Candidate Form */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Name</label>
                      <input
                        type="text"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-400 transition text-sm"
                        placeholder="Enter name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Email</label>
                      <input
                        type="email"
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-400 transition text-sm"
                        placeholder="Enter email"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addCandidate}
                    className="w-full bg-violet-500/20 border border-violet-400/30 text-violet-300 py-2 rounded-lg font-bold hover:bg-violet-500/30 transition-all text-sm"
                  >
                    <span className="mr-2">➕</span>
                    Add Candidate
                  </button>
                </div>

                {/* Candidates List */}
                {newMeeting.candidates.length > 0 && (
                  <div className="space-y-2">
                    {newMeeting.candidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between hover:bg-white/10 transition"
                      >
                        <div className="flex-1">
                          <p className="text-white font-bold text-sm">{candidate.name}</p>
                          <p className="text-slate-400 text-xs">{candidate.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCandidate(candidate.id)}
                          className="w-8 h-8 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition flex items-center justify-center"
                          title="Remove candidate"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {newMeeting.candidates.length === 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <p className="text-slate-400 text-sm">No candidates added yet</p>
                  </div>
                )}
              </div>

              <div className="bg-violet-500/10 border border-violet-400/20 rounded-2xl p-4">
                <p className="text-xs text-violet-200 flex items-start gap-2">
                  <span>💡</span>
                  <span>AI Tip: Schedule meetings during low-productivity hours to maximize focus time for deep work.</span>
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-violet-500/30"
                >
                  Schedule Meeting
                </button>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-6 bg-white/5 border border-white/10 text-slate-300 py-4 rounded-2xl font-bold hover:bg-white/10 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Meeting Notes Modal */}
      {showNotesModal && selectedMeeting && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="glass-card rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-white">{selectedMeeting.title} - Meeting Notes</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {selectedMeeting.date} • {selectedMeeting.time}
                </p>
              </div>
              <button
                onClick={() => setShowNotesModal(false)}
                className="w-10 h-10 rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Discussion */}
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  💬 Discussion
                </label>
                <textarea
                  value={meetingNotes.discussion}
                  onChange={(e) => setMeetingNotes({ ...meetingNotes, discussion: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-400 transition resize-none"
                  rows="4"
                  placeholder="What was discussed in the meeting?"
                />
              </div>

              {/* Important Points */}
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  ⭐ Important Points
                </label>
                <textarea
                  value={meetingNotes.importantPoints}
                  onChange={(e) => setMeetingNotes({ ...meetingNotes, importantPoints: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-400 transition resize-none"
                  rows="4"
                  placeholder="Key takeaways and important points..."
                />
              </div>

              {/* Action Items */}
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  🎯 Action Items
                </label>
                <textarea
                  value={meetingNotes.actionItems}
                  onChange={(e) => setMeetingNotes({ ...meetingNotes, actionItems: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-400 transition resize-none"
                  rows="4"
                  placeholder="Tasks assigned, deadlines, next steps..."
                />
              </div>

              {/* Display saved notes if viewing */}
              {selectedMeeting.notes && (
                <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-2xl p-4">
                  <p className="text-xs text-emerald-200 flex items-start gap-2">
                    <span>✅</span>
                    <span>Notes saved successfully. You can edit and update them anytime.</span>
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={saveNotes}
                  className="flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-violet-500/30"
                >
                  💾 Save Notes
                </button>
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="px-6 bg-white/5 border border-white/10 text-slate-300 py-4 rounded-2xl font-bold hover:bg-white/10 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Summary Modal */}
      {showSummaryModal && selectedMeeting?.aiSummary && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto">
          <div className="glass-card rounded-3xl p-8 max-w-4xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-white">{selectedMeeting.title} - AI Summary</h3>
                <p className="text-sm text-slate-400 mt-1">Generated by AI Assistant</p>
              </div>
              <button
                onClick={() => setShowSummaryModal(false)}
                className="w-10 h-10 rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Key Discussion Points */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h4 className="text-lg font-black text-blue-300 mb-3 flex items-center gap-2">
                  💬 Key Discussion Points
                </h4>
                <ul className="space-y-2">
                  {selectedMeeting.aiSummary.keyPoints.map((point, i) => (
                    <li key={i} className="text-slate-300 flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Decisions Taken */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h4 className="text-lg font-black text-emerald-300 mb-3 flex items-center gap-2">
                  ✅ Decisions Taken
                </h4>
                <ul className="space-y-2">
                  {selectedMeeting.aiSummary.decisions.map((decision, i) => (
                    <li key={i} className="text-slate-300 flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span>{decision}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Items */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h4 className="text-lg font-black text-violet-300 mb-3 flex items-center gap-2">
                  🎯 Action Items
                  <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-1 rounded-full">
                    {selectedMeeting.aiSummary.actionItems.length}
                  </span>
                </h4>
                <div className="space-y-3">
                  {selectedMeeting.aiSummary.actionItems.map((item, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-white font-bold mb-1">{item.task}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-violet-500/20 text-violet-300 px-2 py-1 rounded-full">
                          👤 {item.assignee}
                        </span>
                        <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">
                          📅 {item.deadline}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Alerts */}
              <div className="bg-red-500/10 border border-red-400/30 rounded-2xl p-6">
                <h4 className="text-lg font-black text-red-300 mb-3 flex items-center gap-2">
                  ⚠️ Risk Alerts
                </h4>
                <ul className="space-y-2">
                  {selectedMeeting.aiSummary.risks.map((risk, i) => (
                    <li key={i} className="text-red-300 flex items-start gap-2">
                      <span className="text-red-400 mt-1">⚠</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI Recommendation */}
              <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-400/30 rounded-2xl p-6">
                <h4 className="text-lg font-black text-violet-300 mb-3 flex items-center gap-2">
                  🧠 AI Recommendation
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  {selectedMeeting.aiSummary.aiRecommendation}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 bg-white/5 border border-white/10 text-slate-300 py-3 rounded-xl font-bold hover:bg-white/10 transition">
                  📥 Download PDF
                </button>
                <button className="flex-1 bg-white/5 border border-white/10 text-slate-300 py-3 rounded-xl font-bold hover:bg-white/10 transition">
                  📧 Email Summary
                </button>
                <button className="flex-1 bg-violet-500/20 border border-violet-400/30 text-violet-300 py-3 rounded-xl font-bold hover:bg-violet-500/30 transition">
                  📋 Copy to Clipboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Info */}
      <div className="bg-violet-500/10 border border-violet-400/20 rounded-2xl p-5">
        <p className="text-violet-200 font-black mb-2 flex items-center gap-2">
          <span>🤖</span>
          AI Meeting Assistant Active
        </p>
        <p className="text-sm text-slate-300">
          AI will automatically record meetings you can't attend, generate summaries with key points, 
          extract action items, and send smart notifications to keep you updated.
        </p>
      </div>
    </div>
  );
}
