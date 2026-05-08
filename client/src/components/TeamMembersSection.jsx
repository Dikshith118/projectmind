import { useState } from 'react';

/**
 * TEAM MEMBERS SECTION
 * 
 * Component for adding team members when creating a project
 */
export default function TeamMembersSection({ teamMembers, onTeamMembersChange }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('developer');

  const addMember = () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    // Check if email already added
    if (teamMembers.some(m => m.email.toLowerCase() === email.toLowerCase())) {
      alert('This email has already been added');
      return;
    }

    onTeamMembersChange([...teamMembers, { email, role }]);
    setEmail('');
    setRole('developer');
  };

  const removeMember = (emailToRemove) => {
    onTeamMembersChange(teamMembers.filter(m => m.email !== emailToRemove));
  };

  const updateMemberRole = (emailToUpdate, newRole) => {
    onTeamMembersChange(
      teamMembers.map(m => 
        m.email === emailToUpdate ? { ...m, role: newRole } : m
      )
    );
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'developer':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'viewer':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getInitials = (email) => {
    const name = email.split('@')[0];
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Team Members (Optional)
        </label>
        <p className="text-xs text-gray-400 mb-4">
          Invite team members to collaborate on this project. They'll receive an email invitation.
        </p>
      </div>

      {/* Add Member Form */}
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addMember()}
          placeholder="teammate@example.com"
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
        />
        
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="admin">Admin</option>
          <option value="developer">Developer</option>
          <option value="viewer">Viewer</option>
        </select>
        
        <button
          type="button"
          onClick={addMember}
          className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
        >
          Add
        </button>
      </div>

      {/* Team Members List */}
      {teamMembers.length > 0 && (
        <div className="space-y-2 mt-4">
          <div className="text-sm font-medium text-gray-300 mb-2">
            Team Members ({teamMembers.length})
          </div>
          
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                {getInitials(member.email)}
              </div>
              
              {/* Email */}
              <div className="flex-1">
                <div className="text-sm text-white">{member.email}</div>
                <div className="text-xs text-gray-400">Will receive invitation</div>
              </div>
              
              {/* Role Selector */}
              <select
                value={member.role}
                onChange={(e) => updateMemberRole(member.email, e.target.value)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border ${getRoleColor(member.role)} focus:outline-none`}
              >
                <option value="admin">Admin</option>
                <option value="developer">Developer</option>
                <option value="viewer">Viewer</option>
              </select>
              
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeMember(member.email)}
                className="text-red-400 hover:text-red-300 transition-colors"
                title="Remove member"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Role Descriptions */}
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4 mt-4">
        <div className="text-xs text-gray-400 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-purple-400 font-medium">Admin:</span>
            <span>Can edit tasks, invite members, and manage project settings</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-cyan-400 font-medium">Developer:</span>
            <span>Can edit tasks, update progress, and collaborate on work</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-400 font-medium">Viewer:</span>
            <span>Can view project and tasks but cannot make changes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
